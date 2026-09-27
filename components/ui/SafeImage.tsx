"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  fallbackSrc = "/arac-placeholder.svg",
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // If the src prop changes externally, update state
  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

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
