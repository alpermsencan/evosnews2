import { prisma } from "@/lib/prisma";
import CommunityBoard from "@/components/community/CommunityBoard";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import PollWidget from "@/components/ui/PollWidget";
import { getActivePoll, getByCategory } from "@/lib/queries";
import { IconUsers } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Topluluk",
  description:
    "Evos kullanıcı topluluğu: elektrikli araç deneyimleri, şarj notları ve sorular.",
};

export default async function CommunityPage() {
  const [posts, topics, poll, news, stats] = await Promise.all([
    prisma.communityPost.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    }),
    prisma.communityPost.findMany({
      select: { topic: true },
      distinct: ["topic"],
      orderBy: { topic: "asc" },
    }),
    getActivePoll(),
    getByCategory("topluluk", 3),
    prisma.communityPost.aggregate({ _sum: { likes: true, replies: true }, _count: true }),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-orange-600 to-red-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconUsers className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">TOPLULUK</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Elektrikli araç sahiplerinin deneyim paylaştığı, soru sorduğu ve yol
          notlarını aktardığı Evos topluluğu.
        </p>
        <div className="mt-1 grid grid-cols-3 gap-3">
          <Stat label="Konu" value={`${stats._count}`} />
          <Stat label="Beğeni" value={`${stats._sum.likes ?? 0}`} />
          <Stat label="Yanıt" value={`${stats._sum.replies ?? 0}`} />
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <CommunityBoard
            topics={topics.map((t) => t.topic)}
            initialPosts={posts.map((p) => ({
              ...p,
              createdAt: p.createdAt.toISOString(),
            }))}
          />
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[330px]">
          {poll && (
            <PollWidget
              poll={{
                id: poll.id,
                question: poll.question,
                options: poll.options,
                votes: poll.votes,
              }}
            />
          )}

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <h3 className="text-base font-black text-neutral-900">
              Topluluk kuralları
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-neutral-600">
              <li>• Deneyiminizi mümkün olduğunca veriyle paylaşın.</li>
              <li>• Marka tartışmalarında saygılı bir dil kullanın.</li>
              <li>• Reklam ve ilan paylaşımları Evos Market&apos;e aittir.</li>
              <li>• Kişisel verilerinizi (plaka, şase) paylaşmayın.</li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="bg-orange-600 px-4 py-3 text-sm font-black text-white">
              EN ÇOK KONUŞULAN KONULAR
            </div>
            <ul className="flex flex-col">
              {topics.map((t) => {
                const count = posts.filter((p) => p.topic === t.topic).length;
                return (
                  <li
                    key={t.topic}
                    className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 text-sm last:border-0"
                  >
                    <span className="font-bold text-neutral-700">{t.topic}</span>
                    <span className="text-xs font-black text-neutral-400">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>

      {news.length > 0 && (
        <section>
          <SectionTitle title="TOPLULUK HABERLERİ" href="/kategori/topluluk" color="#c2410c" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {news.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}
