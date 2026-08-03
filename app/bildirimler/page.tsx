import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/user/Avatar";
import MarkNotificationsRead from "@/components/user/MarkNotificationsRead";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bildirimler" };

const TYPE_LABEL: Record<string, string> = {
  reply: "YANIT",
  comment_like: "BEĞENİ",
  follow: "TAKİP",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/bildirimler");

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { name: true, username: true, avatar: true } },
    },
  });

  const unread = items.filter((i) => !i.isRead).length;

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <MarkNotificationsRead unread={unread} />

      <h1 className="text-lg font-black text-neutral-900">
        Bildirimler
        {unread > 0 && (
          <span className="ml-2 rounded bg-evos px-2 py-0.5 text-xs font-black text-white">
            {unread} yeni
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14">
          <p className="text-sm text-neutral-500">
            Henüz bildirimin yok. Yorumların beğenildiğinde, yanıtlandığında ve
            biri seni takip ettiğinde burada göreceksin.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {items.map((n) => {
            const inner = (
              <div
                className={`flex items-center gap-3 border-b border-neutral-100 px-4 py-3 transition last:border-0 ${
                  n.isRead ? "" : "bg-red-50/50"
                } hover:bg-neutral-50`}
              >
                <Avatar
                  src={n.actor?.avatar ?? null}
                  name={n.actor?.name ?? "E"}
                  size="sm"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-bold text-neutral-800">
                    {n.message}
                  </span>
                  <span className="text-[11px] font-bold text-neutral-400">
                    {TYPE_LABEL[n.type] ?? n.type.toUpperCase()} ·{" "}
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                {!n.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-evos" />
                )}
              </div>
            );

            return (
              <li key={n.id}>
                {n.href ? <Link href={n.href}>{inner}</Link> : inner}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
