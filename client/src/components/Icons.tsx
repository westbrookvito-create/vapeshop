type IconProps = { size?: number; strokeWidth?: number; className?: string };

const base = (size = 22, strokeWidth = 1.8) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const HomeIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const GridIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </svg>
);

export const CartIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <path d="M2.5 3h2.2l2 12.2a1.6 1.6 0 0 0 1.6 1.3h9.2a1.6 1.6 0 0 0 1.6-1.3L21 7.5H6" />
  </svg>
);

export const ReceiptIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M6 2.5h12v19l-2.3-1.5L13.6 21l-1.6-1.5L10.4 21l-2.1-1L6 21.5Z" />
    <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
  </svg>
);

export const UserIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c1.3-3.8 4.2-5.8 7.5-5.8s6.2 2 7.5 5.8" />
  </svg>
);

export const ChartIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 20V10M11 20V4M18 20v-7" />
    <path d="M2.5 20.5h19" />
  </svg>
);

export const BoxIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </svg>
);

export const TagIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M11.5 3H5.8A1.8 1.8 0 0 0 4 4.8v5.7c0 .48.19.93.53 1.27l8.7 8.7a1.8 1.8 0 0 0 2.54 0l5.4-5.4a1.8 1.8 0 0 0 0-2.54l-8.7-8.7A1.8 1.8 0 0 0 11.5 3Z" />
    <circle cx="8.7" cy="8.7" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const UsersIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.8 19c1.1-3.3 3.5-5 6.2-5s5.1 1.7 6.2 5" />
    <path d="M15.5 5.3a3.2 3.2 0 0 1 0 6.2M18.5 19c-.5-2.6-1.8-4.3-3.6-5.1" />
  </svg>
);

export const SettingsIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V19.5a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.56V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10c.14.45.5.85 1 1h.4a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.56 1Z" />
  </svg>
);

export const ChevronLeftIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M15 5.5 8 12l7 6.5" />
  </svg>
);

export const ChevronRightIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M9 5.5 16 12l-7 6.5" />
  </svg>
);

export const SearchIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </svg>
);

export const HeartIcon = ({ size, strokeWidth, filled }: IconProps & { filled?: boolean }) => (
  <svg {...base(size, strokeWidth)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.2s-7.6-4.6-9.9-9.2C.7 7.5 2.4 4 6 4c2 0 3.6 1.1 6 3.4C14.4 5.1 16 4 18 4c3.6 0 5.3 3.5 3.9 7-2.3 4.6-9.9 9.2-9.9 9.2Z" />
  </svg>
);

export const StarIcon = ({ size, strokeWidth, filled }: IconProps & { filled?: boolean }) => (
  <svg {...base(size, strokeWidth)} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.4-.6Z" />
  </svg>
);

export const PlusIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M5 12h14" />
  </svg>
);

export const TrashIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 7h16M9.5 7V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.5 7 7.3 19a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
  </svg>
);

export const CheckIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const XIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const EditIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 20h4.2L18.8 9.4a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8Z" />
    <path d="m13 6.5 4.5 4.5" />
  </svg>
);

export const FilterIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const BellIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4.4 1.5 5.6 1.5 6.5H4.5C4.5 14.6 6 13.4 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const TruckIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M2.5 6h10v10h-10Z" />
    <path d="M12.5 10h4l3.5 3.5V16h-7.5Z" />
    <circle cx="6.5" cy="18" r="1.7" />
    <circle cx="16" cy="18" r="1.7" />
  </svg>
);

export const WalletIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5v10A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5Z" />
    <path d="M15.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" fill="currentColor" stroke="none" />
    <path d="M3 9.5h16" />
  </svg>
);

export const ArrowRightIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const LogOutIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M9 20H5.5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
    <path d="M16 16l4-4-4-4M20 12H9" />
  </svg>
);
