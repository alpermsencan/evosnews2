import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import UserRowActions from "@/components/admin/UserRowActions";
import Avatar from "@/components/user/Avatar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      role: true,
      isBanned: true,
      createdAt: true,
      _count: { select: { comments: true, followers: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    label: `${u.name} (@${u.username})`,
    search: `${u.name} ${u.username} ${u.email} ${u.role}`,
    cells: [
      <span key="u" className="flex items-center gap-2">
        <Avatar src={u.avatar} name={u.name} size="xs" />
        <span className="flex flex-col leading-tight">
          <Link
            href={`/profil/${u.username}`}
            target="_blank"
            className="font-bold text-neutral-900 hover:text-evos"
          >
            {u.name}
          </Link>
          <span className="text-[11px] text-neutral-400">@{u.username}</span>
        </span>
      </span>,
      <span key="e" className="text-[12px] text-neutral-600">
        {u.email}
      </span>,
      <span key="c" className="text-[12px] text-neutral-600">
        {u._count.comments} yorum · {u._count.followers} takipçi
      </span>,
      <UserRowActions
        key="a"
        id={u.id}
        role={u.role}
        isBanned={u.isBanned}
      />,
      <span key="d" className="text-[11px] text-neutral-500">
        {formatDate(u.createdAt, false)}
      </span>,
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">
        Üyeler ({users.length})
      </h2>
      <p className="text-sm text-neutral-500">
        Rol değişimi ve askıya alma anında uygulanır. Üye silindiğinde yorumları
        anonim olarak korunur.
      </p>

      <AdminTable
        endpoint="/api/admin/users"
        columns={["ÜYE", "E-POSTA", "ETKİNLİK", "ROL / DURUM", "KAYIT"]}
        rows={rows}
      />
    </div>
  );
}
