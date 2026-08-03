import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yönetim Girişi" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-evos-ink p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
