"use client";

import Image from "next/image";

export default function BrandWordmark({
  className = "",
  alt = "Chainguard logo",
  priority = false,
  sizes
}) {
  const classes = ["h-auto w-auto", className].filter(Boolean).join(" ");

  return (
    <Image
      src="/chainguard-logo.jpeg"
      alt={alt}
      width={332}
      height={98}
      priority={priority}
      sizes={sizes}
      className={classes}
    />
  );
}
