import { fail } from "@/lib/api";

/** No session is issued until a verified OAuth/OIDC flow is configured. */
export async function POST() {
  return fail("Sosyal giriş şu anda kullanılamıyor. E-posta ve şifrenizle giriş yapın.", 503);
}
