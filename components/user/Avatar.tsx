const SIZES = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
};

/** Avatar; görsel yoksa baş harf rozetine düşer */
export default function Avatar({
  src,
  name,
  size = "sm",
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = `shrink-0 overflow-hidden rounded-full ${SIZES[size]} ${className}`;

  if (src)
    return (
      // Üye avatarları Cloudinary veya dış URL olabildiği için next/image kullanmıyoruz
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${base} bg-neutral-100 object-cover`}
      />
    );

  return (
    <span
      className={`${base} flex items-center justify-center bg-evos/10 font-black text-evos`}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
