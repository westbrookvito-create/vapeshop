import { CylinderIcon, CpuIcon, FlaskIcon, DropletIcon, BoxIcon, WrenchIcon } from "./Icons";

const MAP: Record<string, (props: { size?: number; strokeWidth?: number }) => JSX.Element> = {
  disposable: CylinderIcon,
  pod: CpuIcon,
  liquid: FlaskIcon,
  salt: DropletIcon,
  cartridge: BoxIcon,
  accessory: WrenchIcon,
};

export const CATEGORY_ICON_KEYS = Object.keys(MAP);

export default function CategoryIcon({ icon, size = 22, strokeWidth }: { icon: string; size?: number; strokeWidth?: number }) {
  const Cmp = MAP[icon] || BoxIcon;
  return <Cmp size={size} strokeWidth={strokeWidth} />;
}
