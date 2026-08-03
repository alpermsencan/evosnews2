"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type ReactQuillType from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { uploadToCloudinary } from "./ImageUpload";

type QuillRef = { forwardedRef: React.RefObject<ReactQuillType | null> };

/** Quill tarayıcı API'lerine bağlı olduğu için SSR kapalı yüklenir */
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const Wrapped = ({
      forwardedRef,
      ...props
    }: QuillRef & React.ComponentProps<typeof RQ>) => (
      <RQ ref={forwardedRef} {...props} />
    );
    Wrapped.displayName = "ReactQuillWrapped";
    return Wrapped;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-md border border-neutral-300 bg-neutral-50 text-[11px] font-black text-neutral-400">
        EDİTÖR YÜKLENİYOR...
      </div>
    ),
  }
);

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "indent",
  "align",
  "color",
  "background",
  "link",
  "image",
  "video",
];

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
  const quillRef = useRef<ReactQuillType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  /** Toolbar'daki görsel butonu: base64 yerine Cloudinary'ye yükler */
  const imageHandler = useMemo(
    () => () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");
        try {
          const [url] = await uploadToCloudinary([file], folder);
          const editor = quillRef.current?.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          const index = range ? range.index : editor.getLength();
          editor.insertEmbed(index, "image", url, "user");
          editor.setSelection(index + 1, 0);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
        } finally {
          setUploading(false);
        }
      };
      input.click();
    },
    [folder]
  );

  const modules = useMemo(
    () => ({
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
        handlers: { image: imageHandler },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="evos-quill">
        <ReactQuill
          forwardedRef={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={FORMATS}
          placeholder={placeholder}
        />
      </div>
      {uploading && (
        <span className="text-[11px] font-bold text-neutral-500">
          Görsel Cloudinary&apos;ye yükleniyor...
        </span>
      )}
      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </div>
  );
}
