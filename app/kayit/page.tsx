import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/user/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Üye Ol — EVOtoPilot",
  description: "EVOtoPilot'a ücretsiz üye ol; ilan ver, satıcılarla mesajlaş, yorum yap ve beğen.",
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
