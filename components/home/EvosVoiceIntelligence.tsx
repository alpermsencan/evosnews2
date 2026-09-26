"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconSparkles } from "@/components/ui/Icons";

export default function EvosVoiceIntelligence() {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Tarayıcı ses tanıma desteği kontrolü
    const SpeechVal = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechVal) {
      const rec = new SpeechVal();
      rec.continuous = false;
      rec.lang = "tr-TR";
      rec.interimResults = false;

      rec.onstart = () => {
        setListening(true);
        setText("Dinleniyor...");
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setText(resultText);
        setListening(false);
        // Ses tanıma bittiğinde otomatik AI Danışman sayfasına aramayla git
        setTimeout(() => {
          router.push(`/ai-danisman?q=${encodeURIComponent(resultText)}`);
        }, 1200);
      };

      rec.onerror = (e: any) => {
        console.error("Ses tanıma hatası:", e);
        setListening(false);
        setText("Hata oluştu. Lütfen tekrar deneyin.");
      };

      rec.onend = () => {
        setListening(false);
      };

      setRecognition(rec);
    }
  }, [router]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen aşağıdaki arama kutusunu kullanın.");
      return;
    }
    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    router.push(`/ai-danisman?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <section className="px-3 sm:px-0">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        {/* Başlık */}
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-5">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white animate-pulse">
            <IconSparkles className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-black tracking-wider text-neutral-800">
            EVOS VOICE INTELLIGENCE
          </h2>
        </div>

        {/* Sesli Asistan Arayüzü */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-xs font-black text-indigo-700 tracking-wider uppercase mb-1">
            AI EV DANIŞMANI İLE KONUŞUN
          </p>
          <p className="text-sm text-neutral-500 max-w-md mb-6">
            Bütçenizi, istediğiniz menzili veya kasa tipini söyleyin, yapay zeka sizin için en ideal elektrikli araçları anında listelesin.
          </p>

          {/* Mikrofon Butonu & Dalga Efekti */}
          <div className="relative mb-6">
            {listening && (
              <span className="absolute inset-0 h-16 w-16 -m-2 animate-ping rounded-full bg-indigo-500/20"></span>
            )}
            <button
              type="button"
              onClick={toggleListening}
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-white transition-all shadow-md ${
                listening ? "bg-red-500 scale-110" : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
              }`}
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </button>
          </div>

          <p className="text-xs font-bold text-neutral-600 mb-6 min-h-[16px] italic">
            {text || 'Başlamak için mikrofona tıklayın ve konuşun...'}
          </p>

          {/* Prompt ve Manual Arama Kutusu */}
          <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 focus-within:border-indigo-600 focus-within:bg-white transition-all">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Veya buraya yazın (Örn: 2 milyon TL altı SUV)..."
              className="w-full bg-transparent px-2 text-xs text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="rounded-full bg-indigo-600 p-1.5 text-white transition hover:bg-indigo-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>

          {/* Hızlı Öneriler */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {[
              "1.5 Milyon TL altı SUV",
              "Menzili en yüksek araç",
              "Şehir içi küçük elektrikli"
            ].map((suggest, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(suggest);
                  router.push(`/ai-danisman?q=${encodeURIComponent(suggest)}`);
                }}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-bold text-neutral-500 transition hover:border-indigo-600 hover:text-indigo-600"
              >
                {suggest}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
