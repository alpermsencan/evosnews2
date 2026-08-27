"use client";

import { useState } from "react";
import { IconSparkles } from "@/components/ui/Icons";

export default function ElevenLabsVoiceAdvisor() {
  const [active, setActive] = useState(false);

  return (
    <div className="rounded-2xl bg-[#091526] p-6 text-white border border-neutral-800 shadow-xl w-full max-w-md mx-auto">
      <div className="flex flex-col gap-1 mb-5">
        <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase flex items-center gap-1">
          <span>✨</span> EVOS VOICE INTELLIGENCE
        </span>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl mt-1">
          AI EV Danışmanı ile Konuşarak Araç Seç
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed mt-1">
          Bütçeni, günlük kullanımını, şarj imkanını ve beklentilerini söyle; EVOS sana en uygun elektrikli araçları sesli olarak önersin.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Voice Button */}
        <button
          onClick={() => setActive(!active)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition duration-300 shadow-lg ${
            active
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
          }`}
        >
          <span>🎙️</span> {active ? "Sesli Görüşmeyi Sonlandır" : "Sesli Danışmanı Başlat"}
        </button>

        {/* Secondary buttons */}
        <button className="w-full text-center rounded-xl bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 py-3 text-xs font-black text-white transition">
          Araç Önerisi Al →
        </button>
        <button className="w-full text-center rounded-xl bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 py-3 text-xs font-black text-white transition">
          Araçları Karşılaştır
        </button>

        {/* Footnote */}
        <p className="text-[10px] text-neutral-500 text-center mt-1">
          ElevenLabs Voice Agent bağlantısına hazır sesli deneyim altyapısı.
        </p>

        {/* Sample conversation log block */}
        <div className="mt-4 border-t border-neutral-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
              🔊 Danışman nasıl çalışır?
            </span>
            <span className="rounded bg-neutral-900 px-2 py-0.5 text-[9px] font-bold text-neutral-400">
              Örnek
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded bg-neutral-900/60 p-3 border border-neutral-850">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Kullanıcı</span>
              <p className="text-xs text-neutral-200 italic leading-relaxed">
                "2 milyon TL bütçem var. Günde 70 km yapıyorum. Evde şarj imkanım var. Hangi elektrikli aracı almalıyım?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
