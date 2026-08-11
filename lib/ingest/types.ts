import type { DataSource } from "@prisma/client";

/** Bir ingest çalışmasının sayısal sonucu. */
export type IngestStats = {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

export type IngestResult = IngestStats & {
  /** Panelde gösterilecek kısa notlar (atlanan kayıt sebepleri vb.) */
  notes?: string[];
};

export type IngestContext = {
  source: DataSource;
  /** Kaynak başına işlenecek azami kayıt — cron süre limitini aşmamak için. */
  limit: number;
  /**
   * Bu çalışmanın bitmesi gereken an (`Date.now()` ölçeğinde).
   * Yavaş işler (haber yeniden yazımı) bütçe dolunca kalanı bir sonraki
   * çalışmaya bırakır; cron zaman aşımına uğrayıp yarım kalmaz.
   */
  deadline?: number;
};

export type SourceKind = "news" | "stations" | "fx" | "prices";

export type SourceJob = {
  key: string;
  name: string;
  kind: SourceKind;
  /** Bilgi amaçlı cron ifadesi — vercel.json ile aynı olmalı. */
  schedule: string;
  endpoint?: string;
  /** Yayında gösterilecek atıf metni. */
  attribution?: string;
  /** Çalışması için gereken ortam değişkenleri; eksikse kaynak devre dışı sayılır. */
  requiredEnv?: string[];
  run: (ctx: IngestContext) => Promise<IngestResult>;
};

export const emptyStats = (): IngestStats => ({
  fetched: 0,
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
});
