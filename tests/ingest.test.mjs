import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { loadTs } from './helpers/load-ts.mjs';

// Compile the real TypeScript modules in memory. Only external boundaries
// (database, HTTP and model calls) are replaced; no credentials or network needed.

const source = {
  name: 'EV Haber', endpoint: 'https://example.test/feed',
  categorySlug: 'teknoloji', keywords: ['elektrikli araç'], autoPublish: true,
};
const category = { id: 'category-1', slug: 'teknoloji' };
const item = (title, id = title) => `<item><title><![CDATA[${title}]]></title>
  <link>https://example.test/${encodeURIComponent(id)}</link><guid>${id}</guid>
  <description>Yeni model tanıtıldı</description></item>`;

function newsFixture({ feed = '', fetchError, pending = [], existing = null, enabled = false, updateErrorId } = {}) {
  const created = [], updated = [], queries = [], requests = [];
  const prisma = {
    category: {
      findUnique: async () => category, findFirst: async () => category,
      findMany: async () => [category],
    },
    article: {
      findFirst: async (args) => typeof existing === 'function' ? existing(args) : existing,
      create: async ({ data }) => { created.push(data); return data; },
      update: async (args) => {
        if (args.where.id === updateErrorId) throw new Error('Invalid draft');
        updated.push(args);
        return args.data;
      },
      findMany: async (args) => { queries.push(args); return pending; },
    },
  };
  const { newsRssSource } = loadTs('lib/ingest/sources/news-rss.ts', {
    '@/lib/prisma': { prisma },
    '../http': {
      fetchText: async (...args) => {
        requests.push(args);
        if (fetchError) throw fetchError;
        return feed;
      },
      contentHash: (...parts) => createHash('sha1').update(parts.join('\0')).digest('hex'),
    },
    '../rewrite': {
      rewriteEnabled: () => enabled,
      fetchSourcePage: async () => ({ facts: 'Verified facts', image: null }),
      rewriteArticle: async () => ({
        title: 'Elektrikli araç haberi', spot: 'Yeni model', contentHtml: '<p>Yeni haber</p>',
        tags: [], model: 'test-model',
      }),
    },
  });
  return { run: (ctx = {}) => newsRssSource.run({ source, limit: 2, ...ctx }), created, updated, queries, requests };
}

test('topic filtering scans beyond the write limit and caps new drafts', async () => {
  const f = newsFixture({ feed: item('Telefon') + item('Bilgisayar')
    + item('Elektrikli araç A') + item('Elektrikli araç B') + item('Elektrikli araç C') });
  const result = await f.run();
  assert.equal(result.created, 2);
  assert.equal(result.skipped, 2);
  assert.equal(result.fetched, 4);
  assert.deepEqual(f.created.map(a => a.title), ['Elektrikli araç A', 'Elektrikli araç B']);
  assert.ok(f.created.every(a => a.status === 'DRAFT'));
});

test('an existing article does not consume the new-article quota', async () => {
  const f = newsFixture({ feed: item('Elektrikli araç A') + item('Elektrikli araç B'),
    existing: ({ where }) => where.externalId === 'Elektrikli araç A'
      ? { id: 'already-published', status: 'PUBLISHED' } : null });
  const result = await f.run({ limit: 1 });
  assert.equal(result.fetched, 2);
  assert.equal(result.skipped, 1);
  assert.equal(f.updated.length, 0);
  assert.equal(f.created.length, 1);
  assert.equal(f.created[0].title, 'Elektrikli araç B');
});

test('feed scan remains bounded for large off-topic feeds', async () => {
  const f = newsFixture({ feed: item('Telefon').repeat(501) });
  const result = await f.run();
  assert.equal(result.fetched, 500);
  assert.equal(result.created, 0);
});

const draft = {
  id: 'draft-1', title: 'Elektrikli araç', spot: 'Yeni model',
  sourceUrl: 'https://example.test/story', image: '/haber-placeholder.svg', category,
};

test('a feed outage still processes queued drafts and reports a failure', async () => {
  const f = newsFixture({ fetchError: new Error('HTTP 503'), pending: [draft] });
  const result = await f.run();
  assert.equal(result.failed, 1);
  assert.equal(result.updated, 1);
  assert.equal(result.created, 0);
  assert.equal(f.updated[0].data.status, 'PUBLISHED');
  assert.match(result.notes.join(' '), /HTTP 503/);
});

test('queued drafts can also be rewritten during a feed outage', async () => {
  const f = newsFixture({ fetchError: new Error('HTTP 503'), pending: [draft], enabled: true });
  const result = await f.run();
  assert.equal(result.failed, 1);
  assert.equal(result.updated, 1);
  assert.equal(f.updated[0].data.content, '<p>Yeni haber</p>');
});

test('one failed summary publication does not block the rest of the queue', async () => {
  const f = newsFixture({ pending: [draft, { ...draft, id: 'draft-2' }], updateErrorId: draft.id });
  const result = await f.run();
  assert.equal(result.failed, 1);
  assert.equal(result.updated, 1);
  assert.equal(f.updated[0].where.id, 'draft-2');
});

test('manual approval is preserved without an AI key and newest drafts are selected first', async () => {
  const f = newsFixture({ pending: [draft] });
  await f.run({ source: { ...source, autoPublish: false } });
  assert.equal(f.updated[0].data.status, 'DRAFT');
  assert.deepEqual(f.queries[0].orderBy, { publishedAt: 'desc' });
  assert.deepEqual(f.queries[0].where.OR, [{ rewrittenAt: null }, { rewrittenAt: { isSet: false } }]);
});

test('an exhausted deadline defers feed collection and publication', async () => {
  const f = newsFixture({ pending: [draft], feed: item('Elektrikli araç') });
  const result = await f.run({ deadline: Date.now() - 1 });
  assert.equal(f.requests.length, 0);
  assert.equal(f.created.length, 0);
  assert.equal(f.updated.length, 0);
  assert.match(result.notes.join(' '), /Süre bütçesi/);
});

test('feed timeout respects the remaining cron budget', async () => {
  const f = newsFixture();
  await f.run({ deadline: Date.now() + 10_000 });
  assert.ok(f.requests[0][1].timeoutMs > 0 && f.requests[0][1].timeoutMs <= 4_000);
  assert.equal(f.requests[0][1].retries, 0);
});

test('source metadata and decoded text cannot inject HTML into fallback articles', async () => {
  const f = newsFixture({ pending: [{ ...draft, spot: '<img src=x onerror=alert(1)>',
    sourceUrl: 'https://example.test/" onclick="alert(1)' }] });
  await f.run({ source: { ...source, name: '<script>alert(1)</script>' } });
  const content = f.updated[0].data.content;
  assert.ok(!content.includes('<img'));
  assert.ok(!content.includes('<script>'));
  assert.ok(!content.includes('href="https://example.test/" onclick='));
  assert.match(content, /&lt;img/);
});

test('non-HTTP links in legacy drafts are not published', async () => {
  const f = newsFixture({ pending: [{ ...draft, sourceUrl: 'javascript:alert(1)' }] });
  await f.run();
  assert.equal(f.updated.length, 0);
});

test('Atom alternate link is selected instead of its first self link', () => {
  const { linkOf } = loadTs('lib/ingest/xml.ts');
  assert.equal(linkOf('<entry><link rel="self" href="https://example.test/feed/1"/>'
    + '<link rel="alternate" href="https://example.test/story?a=1&amp;b=2"/></entry>'),
  'https://example.test/story?a=1&b=2');
  assert.equal(linkOf('<entry><link href="https://example.test/story"/></entry>'), 'https://example.test/story');
  assert.equal(linkOf('<item><link>https://example.test/rss</link></item>'), 'https://example.test/rss');
  assert.equal(linkOf('<link rel="self" href="https://example.test/feed"/>'), '');
});

test('invalid XML character references do not abort the feed', () => {
  const { decodeEntities } = loadTs('lib/ingest/xml.ts');
  assert.equal(decodeEntities('&#99999999; &#x110000; &#xD800; &#-1;'), '&#99999999; &#x110000; &#xD800; &#-1;');
  assert.equal(decodeEntities('&#x1F697; &#351; &amp;'), '🚗 ş &');
});

function runnerFixture(stats) {
  const updates = [];
  const prisma = {
    dataSource: {
      findUnique: async () => ({ id: 'source-1', key: 'news:test', kind: 'news', isActive: true }),
      update: async args => { updates.push(args); },
    },
    ingestRun: { create: async () => ({ id: 'run-1' }), update: async () => ({}) },
    $transaction: async operations => Promise.all(operations),
  };
  const { runSource } = loadTs('lib/ingest/runner.ts', {
    'server-only': {}, '@/lib/prisma': { prisma },
    '@/lib/cache': { TAGS: { articles: 'articles', stations: 'stations', tickers: 'tickers', prices: 'prices' } },
    './sources': { SOURCES: { news: { run: async () => stats } }, DEFAULT_SOURCES: [] },
  });
  return { runSource, updates };
}

test('a partial ingest preserves last success and records its error', async () => {
  const f = runnerFixture({ fetched: 0, created: 0, updated: 1, skipped: 0, failed: 1, notes: ['Feed unavailable'] });
  const result = await f.runSource('news:test');
  assert.equal(result.status, 'partial');
  assert.equal(Object.hasOwn(f.updates[0].data, 'lastOkAt'), false);
  assert.equal(f.updates[0].data.lastError, 'Feed unavailable');
});

test('a successful ingest updates last success and clears the previous error', async () => {
  const f = runnerFixture({ fetched: 1, created: 1, updated: 0, skipped: 0, failed: 0 });
  const result = await f.runSource('news:test');
  assert.equal(result.status, 'ok');
  assert.ok(f.updates[0].data.lastOkAt instanceof Date);
  assert.equal(f.updates[0].data.lastError, null);
});

function cronFixture(outcomes) {
  const revalidated = [];
  const { GET } = loadTs('app/api/cron/[job]/route.ts', {
    'next/cache': { revalidateTag: tag => revalidated.push(tag) },
    '@/lib/prisma': { prisma: { dataSource: { findFirst: async () => ({ lastOkAt: new Date() }) } } },
    '@/lib/ingest/runner': {
      runKind: async () => ({ outcomes, tags: ['articles'] }), ensureSources: async () => {},
    },
    '@/lib/ingest/prune': { pruneArchive: async () => ({ archived: 0, drafts: 0, offTopic: 0 }) },
    '@/lib/ingest/recategorize': { recategorizeArchive: async () => ({ moved: 0 }) },
    '@/lib/freshness': { checkFreshness: async () => [], summarize: () => ({ ok: true, stale: [] }) },
    '@/lib/cache': { TAGS: { articles: 'articles' } },
  });
  return { revalidated, run: async (job = 'news') => {
    const previous = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test-only-value';
    try {
      return await GET(new Request('https://example.test/api/cron/' + job, {
        headers: { authorization: 'Bearer test-only-value' },
      }), { params: Promise.resolve({ job }) });
    } finally {
      if (previous === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = previous;
    }
  } };
}

for (const [statuses, expected] of [
  [['ok'], 200], [['partial'], 207], [['ok', 'error'], 207], [['error'], 500],
]) {
  test(`news cron responds ${expected} for ${statuses.join('/')}`, async () => {
    const f = cronFixture(statuses.map(status => ({
      sourceKey: 'news:test', status, stats: { fetched: 1, created: 0, updated: 1, skipped: 0, failed: status === 'ok' ? 0 : 1 },
    })));
    const response = await f.run();
    assert.equal(response.status, expected);
    assert.deepEqual(f.revalidated, ['articles']);
    assert.equal((await response.json()).job, 'news');
  });
}

test('daily cron reports a partial source failure even when freshness is healthy', async () => {
  const f = cronFixture([{ sourceKey: 'news:test', status: 'partial',
    stats: { fetched: 0, created: 0, updated: 0, skipped: 0, failed: 1 } }]);
  assert.equal((await f.run('daily')).status, 207);
});
