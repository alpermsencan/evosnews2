"use client";

import { useState } from "react";

type Poll = {
  id: string;
  question: string;
  options: string[];
  votes: number[];
};

export default function PollWidget({ poll }: { poll: Poll }) {
  const [votes, setVotes] = useState(poll.votes);
  const [voted, setVoted] = useState(false);
  const [pending, setPending] = useState<number | null>(null);

  const total = votes.reduce((a, b) => a + b, 0) || 1;

  const vote = async (i: number) => {
    if (voted) return;
    setPending(i);
    const optimistic = votes.map((v, idx) => (idx === i ? v + 1 : v));
    setVotes(optimistic);
    setVoted(true);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, optionIndex: i }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.votes)) setVotes(data.votes);
    } catch {
      /* optimistik sonuç korunur */
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center gap-2 bg-volt px-4 py-3">
        <h3 className="text-sm font-black tracking-wide text-white">
          GÜNÜN ANKETİ
        </h3>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm font-bold text-neutral-800">{poll.question}</p>
        <div className="flex flex-col gap-2">
          {poll.options.map((opt, i) => {
            const pct = Math.round((votes[i] / total) * 100);
            return (
              <button
                key={opt}
                onClick={() => vote(i)}
                disabled={voted}
                className={`relative overflow-hidden rounded-md border px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                  voted
                    ? "cursor-default border-neutral-200 text-neutral-700"
                    : "border-neutral-200 text-neutral-700 hover:border-volt hover:bg-volt/5"
                }`}
              >
                {voted && (
                  <span
                    className="absolute inset-y-0 left-0 bg-volt/15"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span>{opt}</span>
                  {voted && (
                    <span className="shrink-0 text-xs font-black text-volt-dark">
                      %{pct}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-semibold text-neutral-400">
          {voted
            ? `${total.toLocaleString("tr-TR")} oy · Katılımınız kaydedildi`
            : `${total.toLocaleString("tr-TR")} kişi oy kullandı`}
          {pending !== null && " · gönderiliyor..."}
        </span>
      </div>
    </div>
  );
}
