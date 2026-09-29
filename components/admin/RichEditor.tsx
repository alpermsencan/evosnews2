"use client";

import { useEffect, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadClient";

export default function RichEditor({
  value,
  onChange,
  placeholder,
  folder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isInternalChangeRef = useRef(false);
  const folderRef = useRef(folder);
  folderRef.current = folder;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function initQuill() {
      if (!containerRef.current) return;

      try {
        const { default: Quill } = await import("quill");
        if (!isMounted || !containerRef.current) return;

        // Container içeriğini temizleyip taze bir editor div'i oluşturalım
        containerRef.current.innerHTML = "";
        const editorHost = document.createElement("div");
        containerRef.current.appendChild(editorHost);

        const quill = new Quill(editorHost, {
          theme: "snow",
          placeholder: placeholder || "İçeriği buraya yazın...",
          modules: {
            toolbar: {
              container: [
                [{ header: [2, 3, 4, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["blockquote", "code-block"],
                ["link", "image", "video"],
                ["clean"],
              ],
              handlers: {
                image: () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError("");
                    try {
                      const [url] = await uploadToCloudinary([file], folderRef.current);
                      if (!quillRef.current) return;
                      const range = quillRef.current.getSelection(true);
                      const index = range ? range.index : quillRef.current.getLength();
                      quillRef.current.insertEmbed(index, "image", url, "user");
                      quillRef.current.setSelection(index + 1, 0);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
                    } finally {
                      setUploading(false);
                    }
                  };
                  input.click();
                },
              },
            },
            clipboard: { matchVisual: false },
          },
        });

        if (value) {
          quill.root.innerHTML = value;
        }

        quill.on("text-change", () => {
          if (!isMounted) return;
          isInternalChangeRef.current = true;
          const html = quill.root.innerHTML;
          onChange(html === "<p><br></p>" ? "" : html);
          setTimeout(() => {
            isInternalChangeRef.current = false;
          }, 0);
        });

        quillRef.current = quill;
        setLoading(false);
      } catch (err) {
        console.error("Quill yüklenirken hata:", err);
        setError("Editör başlatılamadı.");
        setLoading(false);
      }
    }

    initQuill();

    return () => {
      isMounted = false;
      quillRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dışarıdan gelen `value` değiştiğinde (ör. veritabanından çekilip form doldurulunca) editörü senkronize et
  useEffect(() => {
    if (!quillRef.current || isInternalChangeRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    const targetHtml = value || "";
    if (targetHtml !== currentHtml && (targetHtml || currentHtml !== "<p><br></p>")) {
      quillRef.current.root.innerHTML = targetHtml;
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5">
      <link rel="stylesheet" href="/css/quill.snow.css" />
      {loading && (
        <div className="flex h-64 items-center justify-center rounded-md border border-neutral-300 bg-neutral-50 text-[11px] font-black text-neutral-400">
          EDİTÖR YÜKLENİYOR...
        </div>
      )}
      <div
        className={`evos-quill ${loading ? "hidden" : "block"}`}
        ref={containerRef}
      />
      {uploading && (
        <span className="text-[11px] font-bold text-neutral-500">
          Görsel Cloudinary&apos;ye yükleniyor...
        </span>
      )}
      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </div>
  );
}
