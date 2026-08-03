import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/user/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Evos Gazete üye girişi.",
};

export default function LoginPage() {
  return (
    <div className="flex justify-center px-3 py-8 sm:px-0 sm:py-12">
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md animate-pulse rounded-lg bg-white" />
        }
      >
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
