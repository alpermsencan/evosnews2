"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string;
  fallbackSrc?: string;
}

function ImageWithFallback({
  src,
  fallbackSrc = "/arac-placeholder.svg",
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // If src is a data URI or external, unoptimized ensures Next.js doesn't fail
  const isDataUri = typeof imgSrc === "string" && imgSrc.startsWith("data:");

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      unoptimized={isDataUri || props.unoptimized}
      onError={handleError}
    />
  );
}

export default function SafeImage(props: SafeImageProps) {
  return <ImageWithFallback key={`${props.src}:${props.fallbackSrc || ""}`} {...props} />;
}
