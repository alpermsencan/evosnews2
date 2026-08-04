import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import PostRowActions from "@/components/admin/PostRowActions";
import Avatar from "@/components/user/Avatar";
import { formatDate } from "@/lib/utils";
import { excerpt } from "@/lib/social";

export const dynamic = "force-dynamic";

const VISIBILITY_LABEL: Record<string, string> = {
  public: "Herkese açık",
  friends: "Arkadaşlar",
  private: "Gizli",
};

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      kind: true,
      body: true,
      images: true,
      posterUrl: true,
      visibility: true,
      isHidden: true,
      likeCount: true,
      commentCount: true,
      views: true,
      createdAt: true,
      author: { select: { name: true, username: true, avatar: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  const rows = posts.map((p) => ({
    id: p.id,
    label: `${p.author.name} — ${excerpt(p.body, 30) || p.kind}`,
    search: `${p.author.name} ${p.author.username} ${p.body} ${p.kind}`,
    cells: [
      <span key="k" className="flex flex-col gap-1">
        <span
          className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-black text-white ${
            p.kind === "reel" ? "bg-neutral-900" : "bg-evos"
          }`}
        >
          {p.kind === "reel" ? "REEL" : "GÖNDERİ"}
        </span>
        {p.isHidden && (
          <span className="w-fit rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">
            YAYINDA DEĞİL
          </span>
        )}
      </span>,

      <span key="u" className="flex items-center gap-2">
        <Avatar src={p.author.avatar} name={p.author.name} size="xs" />
        <span className="flex flex-col leading-tight">
          <Link
            href={`/profil/${p.author.username}`}
            target="_blank"
            className="font-bold text-neutral-900 hover:text-evos"
          >
            {p.author.name}
          </Link>
          <span className="text-[11px] text-neutral-400">
            @{p.author.username}
          </span>
        </span>
      </span>,

      <span key="b" className="flex max-w-md flex-col gap-1">
        <Link
          href={`/gonderi/${p.id}`}
          target="_blank"
          className="line-clamp-2 text-[12px] text-neutral-700 hover:text-evos"
        >
          {excerpt(p.body, 120) || "(metinsiz)"}
        </Link>
        {p.article && (
          <span className="text-[11px] font-bold text-neutral-400">
            📰 {excerpt(p.article.title, 40)}
          </span>
        )}
        {(p.images.length > 0 || p.posterUrl) && (
          <span className="text-[11px] text-neutral-400">
            {p.kind === "reel"
              ? "video ekli"
              : `${p.images.length} görsel ekli`}
          </span>
        )}
      </span>,

      <span key="s" className="text-[12px] text-neutral-600">
        ♥ {p.likeCount} · 💬 {p.commentCount}
        {p.kind === "reel" ? ` · ▶ ${p.views}` : ""}
        <br />
        <span className="text-[11px] text-neutral-400">
          {VISIBILITY_LABEL[p.visibility] ?? p.visibility}
        </span>
      </span>,

      <PostRowActions key="a" id={p.id} isHidden={p.isHidden} />,

      <span key="d" className="text-[11px] text-neutral-500">
        {formatDate(p.createdAt)}
      </span>,
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">
        Gönderiler & Reels ({posts.length})
      </h2>
      <p className="text-sm text-neutral-500">
        Üye paylaşımları ve reel videoları. &quot;Yayından kaldır&quot; içeriği
        silmeden herkesin görüşünden çıkarır; silme işlemi geri alınamaz ve
        beğeni ile yorumları da temizler.
      </p>

      <AdminTable
        endpoint="/api/posts"
        columns={["TÜR", "ÜYE", "İÇERİK", "ETKİLEŞİM", "MODERASYON", "TARİH"]}
        rows={rows}
      />
    </div>
  );
}
