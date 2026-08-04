import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SOCIAL_USER_SELECT, getPeopleSuggestions } from "@/lib/social";
import FriendHub from "@/components/social/FriendHub";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Arkadaşlarım",
  description:
    "Arkadaşlık istekleri, arkadaş listen ve tanıyor olabileceğin kişiler.",
};

const PERSON = { ...SOCIAL_USER_SELECT, bio: true, city: true } as const;

const TAB_MAP: Record<string, "friends" | "incoming" | "outgoing" | "suggestions"> =
  {
    arkadaslar: "friends",
    gelen: "incoming",
    giden: "outgoing",
    oneriler: "suggestions",
  };

type Props = { searchParams: Promise<{ sekme?: string }> };

export default async function FriendsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/arkadaslar");

  const { sekme } = await searchParams;

  const [accepted, incoming, outgoing, suggestions] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
      orderBy: { respondedAt: "desc" },
      include: { requester: { select: PERSON }, addressee: { select: PERSON } },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: user.id, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: { requester: { select: PERSON } },
    }),
    prisma.friendship.findMany({
      where: { requesterId: user.id, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: { addressee: { select: PERSON } },
    }),
    getPeopleSuggestions(user.id, 12),
  ]);

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-black text-neutral-900">Arkadaşlarım</h1>
        <p className="max-w-3xl text-[13px] leading-relaxed text-neutral-500">
          Takip tek yönlüdür; birinin içeriğini akışında görmek için yeterlidir.
          Arkadaşlık ise karşılıklı onay ister ve &quot;arkadaşlarım&quot;
          görünürlüğüyle paylaşılan gönderilere erişim verir.
        </p>
      </header>

      <FriendHub
        initialTab={TAB_MAP[sekme ?? ""] ?? "friends"}
        initial={{
          friends: accepted.map((f) =>
            f.requesterId === user.id ? f.addressee : f.requester
          ),
          incoming: incoming.map((f) => ({
            ...f.requester,
            requestedAt: f.createdAt.toISOString(),
          })),
          outgoing: outgoing.map((f) => ({
            ...f.addressee,
            requestedAt: f.createdAt.toISOString(),
          })),
          suggestions,
        }}
      />
    </div>
  );
}
