import type { CSSProperties } from "react";
import { BoxIcon } from "./Icons";

export default function ProductImage({
  image,
  color,
  style,
  iconSize = 34,
}: {
  image: string | null;
  color: string;
  style?: CSSProperties;
  iconSize?: number;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
      />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.55)",
        ...style,
      }}
    >
      <BoxIcon size={iconSize} strokeWidth={1.4} />
    </div>
  );
}
