import Image, { type ImageProps } from "next/image";

/** next/image that skips optimisation for uploaded or external files. */
export function Img(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const unoptimized = props.unoptimized ?? (src.startsWith("/api/") || src.startsWith("http"));
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} unoptimized={unoptimized} />;
}

export const FALLBACK_LAND_IMAGE = "/images/land-green-valley.jpg";
