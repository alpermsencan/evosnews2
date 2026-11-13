import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server.js';
import { SignJWT } from 'jose';
import { loadTs } from './helpers/load-ts.mjs';

const secret = 'test-only-signing-key-at-least-32-characters';
const request = (path, method = 'GET', body, headers = {}) => new NextRequest('https://example.test' + path, {
  method, headers: { ...headers, ...(body ? { 'content-type': 'application/json' } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
async function withEnv(values, run) {
  const before = Object.fromEntries(Object.keys(values).map(k => [k, process.env[k]]));
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    return await run();
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}
const authEnv = { AUTH_SECRET: secret, ADMIN_USERNAME: 'configured-admin', ADMIN_PASSWORD: 'test-only-configured-password' };

test('admin credentials require configured username/password and a strong secret', async () => {
  await withEnv(authEnv, async () => {
    const auth = loadTs('lib/admin-auth.ts');
    assert.equal(auth.isValidAdminCredentials('configured-admin', authEnv.ADMIN_PASSWORD), true);
    assert.equal(auth.isValidAdminCredentials('wrong-user', authEnv.ADMIN_PASSWORD), false);
    assert.equal(auth.isValidAdminCredentials('configured-admin', 'ytung011'), false); // former bypass
    delete process.env.AUTH_SECRET;
    assert.equal(auth.isValidAdminCredentials('configured-admin', authEnv.ADMIN_PASSWORD), false);
    await assert.rejects(auth.adminToken());
    assert.equal(await auth.isAdminCookie('invalid'), false);
  });
});

test('admin and member tokens cannot be confused; legacy tokens are rejected', async () => {
  await withEnv(authEnv, async () => {
    const admin = loadTs('lib/admin-auth.ts'), member = loadTs('lib/session.ts');
    const a = await admin.adminToken();
    const m = await member.signSession({ sub: 'member-1', username: 'member', name: 'Member', role: 'admin' });
    assert.equal(await admin.isAdminCookie(a), true);
    assert.equal(await admin.isAdminCookie(m), false);
    assert.equal(await member.verifySession(a), null);
    assert.equal((await member.verifySession(m)).sub, 'member-1');
    const old = await new SignJWT({ role: 'admin', username: 'configured-admin' }).setProtectedHeader({ alg: 'HS256' }).setSubject('configured-admin').setExpirationTime('1h').sign(new TextEncoder().encode(secret));
    assert.equal(await admin.isAdminCookie(old), false);
  });
});

test('admin login denies legacy password and accepts configured credentials with secure cookie', async () => {
  await withEnv({ ...authEnv, NODE_ENV: 'production' }, async () => {
    const route = loadTs('app/api/auth/route.ts', { '@/lib/prisma': { prisma: { user: { findFirst: async () => null } } } });
    assert.equal((await route.POST(request('/api/auth', 'POST', { password: 'ytung011' }))).status, 401);
    assert.equal((await route.POST(request('/api/auth', 'POST', { username: 'someone-else', password: authEnv.ADMIN_PASSWORD }))).status, 401);
    const response = await route.POST(request('/api/auth', 'POST', { username: 'configured-admin', password: authEnv.ADMIN_PASSWORD }));
    assert.equal(response.status, 200);
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/i); assert.match(cookie, /Secure/i); assert.match(cookie, /SameSite=lax/i);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await route.POST(request('/api/auth', 'POST', {}, { origin: 'https://attacker.test' }))).status, 403);
  });
});

test('login attempt limit returns 429 and retry information', async () => {
  await withEnv(authEnv, async () => {
    const route = loadTs('app/api/auth/route.ts', { '@/lib/prisma': { prisma: { user: { findFirst: async () => null } } } });
    for (let i = 0; i < 10; i++) assert.equal((await route.POST(request('/api/auth', 'POST', { username: 'rate-test', password: 'bad' }))).status, 401);
    const r = await route.POST(request('/api/auth', 'POST', { username: 'rate-test', password: 'bad' }));
    assert.equal(r.status, 429); assert.ok(Number(r.headers.get('retry-after')) > 0);
  });
});

test('social demo never issues a session or looks up a supplied email', async () => {
  const route = loadTs('app/api/account/social/route.ts');
  const response = await route.POST(request('/api/account/social', 'POST', { provider: 'google', email: 'victim@example.test' }));
  assert.equal(response.status, 503); assert.equal(response.headers.get('set-cookie'), null);
});

test('upload route rejects traversal and symlinks while serving a permitted image', async () => {
  const root = await mkdtemp(join(tmpdir(), 'evos-upload-test-'));
  const cwd = process.cwd;
  try {
    await mkdir(join(root, 'public/uploads'), { recursive: true });
    await writeFile(join(root, 'outside.png'), 'outside-canary');
    await writeFile(join(root, 'public/uploads/safe.png'), 'safe-image-fixture');
    await symlink(join(root, 'outside.png'), join(root, 'public/uploads/link.png'));
    process.cwd = () => root;
    const route = loadTs('app/uploads/[...path]/route.ts');
    for (const segments of [['..!', '..!', 'outside.png'], ['..', '..', 'outside.png'], ['link.png'], ['.env'], ['a/b.png']]) {
      assert.equal((await route.GET(request('/uploads/test'), { params: Promise.resolve({ path: segments }) })).status, 404);
    }
    const r = await route.GET(request('/uploads/safe.png'), { params: Promise.resolve({ path: ['safe.png'] }) });
    assert.equal(r.status, 200); assert.equal(await r.text(), 'safe-image-fixture');
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  } finally { process.cwd = cwd; await rm(root, { recursive: true, force: true }); }
});

for (const [name, methods] of [
  ['leads', ['GET', 'PUT', 'DELETE']], ['newsletter', ['GET', 'DELETE']], ['garage', ['POST', 'DELETE']], ['stats', ['GET']],
]) test(`anonymous management access is denied before database calls: ${name}`, async () => {
  const route = loadTs(`app/api/${name}/route.ts`, {
    '@/lib/admin-auth': { isAdminRequest: async () => false },
    '@/lib/prisma': { prisma: new Proxy({}, { get() { throw Error('Database must not be reached'); } }) },
  });
  for (const method of methods) assert.equal((await route[method](request('/api/' + name, method))).status, 401);
});

test('middleware also denies anonymous private reads, writes and cross-origin mutations', async () => {
  const route = loadTs('middleware.ts', { '@/lib/admin-auth': { ADMIN_COOKIE: 'evos_admin', isAdminCookie: async () => false } });
  for (const [path, method] of [['/api/leads', 'GET'], ['/api/newsletter', 'GET'], ['/api/garage', 'POST'], ['/api/leads', 'DELETE']]) {
    assert.equal((await route.middleware(request(path, method))).status, 401);
  }
  assert.equal((await route.middleware(request('/api/leads', 'POST', {}, { origin: 'https://attacker.test' }))).status, 403);
  assert.equal((await route.middleware(request('/api/leads', 'POST', {}))).headers.get('x-middleware-next'), '1');
});

test('anonymous news queries filter drafts and omit internal/comment private fields', async () => {
  const queries = [];
  const mocks = {
    '@/lib/admin-auth': { isAdminRequest: async () => false },
    '@/lib/prisma': { prisma: { article: {
      findMany: async query => { queries.push(query); return []; }, count: async () => 0,
      findFirst: async query => { queries.push(query); return null; },
    } } },
  };
  assert.equal((await loadTs('app/api/articles/route.ts', mocks).GET(request('/api/articles'))).status, 200);
  assert.equal((await loadTs('app/api/articles/[id]/route.ts', mocks).GET(request('/api/articles/draft'), { params: Promise.resolve({ id: 'draft' }) })).status, 404);
  for (const q of queries) { assert.equal(q.where.status, 'PUBLISHED'); assert.equal(q.select.rewriteError, undefined); }
  assert.equal(queries[1].select.comments.where.approved, true);
  assert.equal(queries[1].select.comments.select.email, undefined);
});

test('OCPI rejects unprovisioned tokens and enforces party scope even in development', async () => {
  const credentials = loadTs('app/api/ocpi/2.2.1/credentials/route.ts', { '@/lib/prisma': { prisma: { ocpiToken: { findUnique: async ({ where }) => { assert.equal(where.version, 2); return null; } } } } });
  assert.equal((await credentials.POST(request('/api/ocpi/credentials', 'POST', { token: 'arbitrary-token-value' }, { authorization: 'Token unknown' }))).status, 401);
  await withEnv({ NODE_ENV: 'development' }, async () => {
    const route = loadTs('app/api/ocpi/2.2.1/receiver/locations/[country_code]/[party_id]/[location_id]/route.ts', {
      '@/lib/prisma': { prisma: { ocpiToken: { findFirst: async ({ where }) => { assert.equal(where.version, 2); return { countryCode: 'TR', partyId: 'AAA', role: 'CPO', isActive: true }; } } } },
    });
    const r = await route.PUT(request('/api/ocpi/receiver', 'PUT', {}, { authorization: 'Token known' }), {
      params: Promise.resolve({ country_code: 'TR', party_id: 'BBB', location_id: '1' }),
    });
    assert.equal(r.status, 403);
  });
});

test('HTML sanitizer removes executable content and retains safe formatting and links', () => {
  const { articleHtml } = loadTs('lib/html.ts');
  const html = articleHtml('<h2>Haber</h2><p>Metin <strong>kalın</strong></p><img src="https://example.test/a.jpg" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">link</a><iframe src="https://attacker.test"></iframe>');
  assert.match(html, /<strong>kalın<\/strong>/);
  assert.ok(!/onerror|<script|javascript:|attacker\.test/.test(html));
  assert.match(html, /rel="noopener noreferrer nofollow"/);
  assert.match(articleHtml('Düz metin\n\nİkinci paragraf'), /<p>İkinci paragraf<\/p>/);
});

test('approved OCPI bootstrap exchange rotates its token without changing tenant identity', async () => {
  const approved = { id: 'approved-id', token: 'approved-bootstrap', countryCode: 'TR', partyId: 'AAA', role: 'CPO', isActive: true };
  let saved;
  const route = loadTs('app/api/ocpi/2.2.1/credentials/route.ts', { '@/lib/prisma': { prisma: { ocpiToken: {
    findUnique: async () => approved,
    update: async args => { saved = args; return { ...approved, ...args.data }; },
  } } } });
  const response = await route.POST(request('/api/ocpi/credentials', 'POST', {
    token: 'remote-credential-at-least-16-chars', roles: [{ role: 'CPO', country_code: 'TR', party_id: 'AAA' }],
  }, { authorization: 'Token approved-bootstrap' }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.data.token, /^[a-f0-9]{64}$/);
  assert.equal(saved.where.id, approved.id);
  assert.equal(saved.data.token, body.data.token);
  assert.equal(saved.data.partyId, undefined);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('administrative request with a valid credential can read protected data', async () => {
  const route = loadTs('app/api/leads/route.ts', {
    '@/lib/admin-auth': { isAdminRequest: async () => true },
    '@/lib/prisma': { prisma: { lead: { findMany: async () => [{ id: 'synthetic', message: 'test' }] } } },
  });
  const response = await route.GET(request('/api/leads'));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).items[0].id, 'synthetic');
});

test('upstream errors and public failures do not expose query credentials', async () => {
  const previous = global.fetch;
  global.fetch = async () => new Response('also contains secret-canary', { status: 403 });
  try {
    const http = loadTs('lib/ingest/http.ts');
    await assert.rejects(http.fetchWithRetry('https://example.test/search?api_key=secret-canary'), e => !e.message.includes('secret-canary'));
    const { fail } = loadTs('lib/api.ts');
    assert.ok(!(await fail('secret-canary', 500).text()).includes('secret-canary'));
  } finally { global.fetch = previous; }
});

test('return URLs reject executable and external schemes and preserve internal paths', () => {
  const { safeReturnPath } = loadTs('lib/return-path.ts');
  for (const path of ['javascript:alert(1)', '//attacker.test', '/\\attacker.test', '/\n/attacker.test']) assert.equal(safeReturnPath(path), '/hesabim');
  assert.equal(safeReturnPath('/hesabim/kaydedilenler?x=1'), '/hesabim/kaydedilenler?x=1');
});

test('missing route coordinates are rejected, but zero is a valid supplied coordinate', async () => {
  await withEnv({ OPENROUTESERVICE_API_KEY: undefined }, async () => {
    const route = loadTs('app/api/route-to/route.ts');
    assert.equal((await route.GET(request('/api/route-to'))).status, 400);
    assert.equal((await route.GET(request('/api/route-to?fromLat=0&fromLng=0&toLat=1&toLng=1'))).status, 200);
  });
});

test('tax calculation follows the shared display brackets at every boundary', () => {
  const { calcOtv } = loadTs('lib/utils.ts');
  for (const [base, kw, expected] of [[1_400_000, 150, 25], [1_650_000, 160, 25], [1_650_001, 160, 55], [1_650_000, 161, 65], [1_650_001, 161, 75]]) {
    const result = calcOtv(base, kw);
    assert.equal(result.rate, expected);
    assert.equal(result.total, base + result.otv + result.kdv);
  }
});

test('unverified, expired or future-dated financial campaigns are hidden', () => {
  const { isCurrentCampaign } = loadTs('lib/campaign-verification.ts');
  const now = Date.parse('2026-11-13T12:00:00Z');
  const evidence = { verifiedAt: '2026-11-12', validUntil: '2026-12-01', verificationUrl: 'https://bank.example/campaign' };
  assert.equal(isCurrentCampaign(evidence, now), true);
  assert.equal(isCurrentCampaign({}, now), false);
  assert.equal(isCurrentCampaign({ ...evidence, validUntil: '2026-11-01' }, now), false);
  assert.equal(isCurrentCampaign({ ...evidence, verifiedAt: '2026-11-14' }, now), false);
  assert.equal(isCurrentCampaign({ ...evidence, verificationUrl: 'javascript:alert(1)' }, now), false);
});

test('unconfigured OCPI pull integrations skip without writing demonstration data', async () => {
  await withEnv({ OCPI_ZES_URL: undefined, OCPI_ZES_TOKEN: undefined, OCPI_ESARJ_URL: undefined, OCPI_ESARJ_TOKEN: undefined, OCPI_TRUGO_URL: undefined, OCPI_TRUGO_TOKEN: undefined }, async () => {
    const route = loadTs('lib/ingest/sources/ocpi-sync.ts', {
      '@/lib/prisma': { prisma: new Proxy({}, { get() { throw Error('Unconfigured source must not write'); } }) },
    });
    const results = await route.syncAllCpos();
    assert.equal(results.length, 3);
    assert.ok(results.every(result => result.skipped === true));
  });
});

test('OCPI pull validates the complete party scope before any database writes', async () => {
  await withEnv({ OCPI_ZES_URL: 'https://cpo.example/locations', OCPI_ZES_TOKEN: 'synthetic-outbound-token' }, async () => {
    const route = loadTs('lib/ingest/sources/ocpi-sync.ts', {
      '@/lib/prisma': { prisma: new Proxy({}, { get() { throw Error('Invalid batch must not write'); } }) },
      '../http': { fetchJson: async () => ({ status_code: 1000, data: [{ id: '1', country_code: 'TR', party_id: 'BAD', name: 'Station', address: 'Address', latitude: 41, longitude: 29, evses: [] }] }) },
    });
    await assert.rejects(route.syncCpoLocations('zes'), /kapsamı dışında/);
  });
});

test('historical Renault fallback prices cannot overwrite the live catalog', async () => {
  const source = loadTs('lib/vehicle-sync/sources/renault.ts', {
    '@/lib/ingest/http': { fetchText: async () => 'Fiyatlar güncellenmektedir' },
    '../image-validator': { validateVehicleImage: () => ({ isValid: false }) },
  });
  const result = await source.fetchRenaultPrices();
  assert.ok(result.length > 0);
  assert.ok(result.every(vehicle => vehicle.variants.length === 0));
});
