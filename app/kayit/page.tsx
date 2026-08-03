import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/user/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Üye Ol",
  description: "Evos Gazete'ye ücretsiz üye ol; yorum yap, beğen, kaydet.",
};

export default function RegisterPage() {
  return (
    <div className="flex justify-center px-3 py-8 sm:px-0 sm:py-12">
      <Suspense
        fallback={
          <div className="h-[32rem] w-full max-w-md animate-pulse rounded-lg bg-white" />
        }
      >
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
