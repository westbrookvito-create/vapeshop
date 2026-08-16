import type { CSSProperties } from "react";
import { BoxIcon } from "./Icons";
import CategoryIcon from "./CategoryIcon";

export default function ProductImage({
  image,
  color,
  categoryIcon,
  style,
  iconSize = 40,
}: {
  image: string | null;
  color: string;
  categoryIcon?: string;
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
        background: `radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%), ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.85)",
        ...style,
      }}
    >
      {categoryIcon ? <CategoryIcon icon={categoryIcon} size={iconSize} strokeWidth={1.3} /> : <BoxIcon size={iconSize} strokeWidth={1.3} />}
    </div>
  );
}
