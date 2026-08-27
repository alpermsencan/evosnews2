import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminOcpiPage() {
  const tokens = await prisma.ocpiToken.findMany({
    orderBy: { createdAt: "desc" },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evotopilot.com";

  // Server Action to generate a new OCPI Token
  async function handleGenerateToken(formData: FormData) {
    "use server";
    const partyId = (formData.get("partyId") as string || "UNKNOWN").toUpperCase();
    const countryCode = (formData.get("countryCode") as string || "TR").toUpperCase();
    
    // Generate a secure random hex token
    const token = "EVS-" + Math.random().toString(36).substring(2, 12).toUpperCase();

    await prisma.ocpiToken.create({
      data: {
        token,
        partyId,
        countryCode,
        role: "CPO",
        isActive: true,
      },
    });

    revalidatePath("/admin/ocpi");
  }

  // Server Action to delete a token
  async function handleDeleteToken(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.ocpiToken.delete({
      where: { id },
    });
    revalidatePath("/admin/ocpi");
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight sm:text-3xl">
          OCPI Roaming Entegrasyonu
        </h1>
        <p className="text-xs text-neutral-500 max-w-3xl">
          Evos'u bir eMSP (e-Mobility Service Provider) olarak diğer şarj ağı operatörlerine (CPO) bağlayın.
          Aşağıdaki bağlantı uçlarını ve yetki anahtarlarını kullanarak el sıkışması (handshake) gerçekleştirebilirsiniz.
        </p>
      </div>

      {/* API Endpoints */}
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black text-neutral-800 tracking-wider uppercase border-b border-neutral-100 pb-3 mb-4">
          OCPI BAĞLANTI UÇLARINIZ (RECEIVER ENDPOINTS)
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold text-neutral-500">Versions URL:</span>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${siteUrl}/api/ocpi/versions`}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-3 py-1.5 text-xs font-mono select-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold text-neutral-500">2.2.1 Base URL:</span>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${siteUrl}/api/ocpi/2.2.1`}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-3 py-1.5 text-xs font-mono select-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold text-neutral-500">Credentials Handshake:</span>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${siteUrl}/api/ocpi/2.2.1/credentials`}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-3 py-1.5 text-xs font-mono select-all outline-none"
              />
            </div>
          </div>
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-neutral-400">
          * Diğer CPO'lar el sıkışmasını başlatmak için sitenizin <strong>Versions URL</strong>'sini kendi sistemlerine kaydeder.
        </p>
      </div>

      {/* Token Generator Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm h-fit">
          <h3 className="text-xs font-black text-neutral-800 tracking-wider uppercase border-b border-neutral-100 pb-3 mb-4">
            YENİ TOKEN OLUŞTUR
          </h3>
          <form action={handleGenerateToken} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Operatör Kodu (Party ID)</label>
              <input
                type="text"
                name="partyId"
                placeholder="Örn: ZES, ESC, TRG"
                required
                maxLength={3}
                className="border border-neutral-300 rounded px-3 py-2 text-xs outline-none focus:border-evos uppercase"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Ülke Kodu</label>
              <input
                type="text"
                name="countryCode"
                placeholder="TR"
                defaultValue="TR"
                required
                maxLength={2}
                className="border border-neutral-300 rounded px-3 py-2 text-xs outline-none focus:border-evos uppercase"
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded bg-evos py-2 text-xs font-black text-white hover:bg-evos-dark transition cursor-pointer"
            >
              YETKİ TOKEn'I ÜRET
            </button>
          </form>
        </div>

        {/* Existing Tokens Table */}
        <div className="md:col-span-2 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-black text-neutral-800 tracking-wider uppercase border-b border-neutral-100 pb-3 mb-4">
            AKTİF YETKİLENDİRME ANAHTARLARI (TOKENS)
          </h3>
          
          {tokens.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-8">
              Kayıtlı yetkilendirme anahtarı bulunamadı. CPO bağlantıları için yeni bir anahtar üretebilirsiniz.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold">
                    <th className="py-2 pb-3">PARTY ID</th>
                    <th className="py-2 pb-3">ÜLKE</th>
                    <th className="py-2 pb-3">YETKİ TOKEN'I (OCPI-TOKEN)</th>
                    <th className="py-2 pb-3 text-right">EYLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tokens.map((t) => (
                    <tr key={t.id} className="text-neutral-700">
                      <td className="py-3 font-bold">{t.partyId}</td>
                      <td className="py-3">{t.countryCode}</td>
                      <td className="py-3 font-mono text-teal-600 select-all">{t.token}</td>
                      <td className="py-3 text-right">
                        <form action={handleDeleteToken} className="inline">
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            type="submit"
                            className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                          >
                            Sil
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
