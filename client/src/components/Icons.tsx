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

export const GridIcon = ({ size, strokeWidth, filled }: IconProps & { filled?: boolean }) => (
  <svg {...base(size, strokeWidth)} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : strokeWidth}>
    <rect x="3.4" y="3.4" width="7.6" height="7.6" rx="2.4" />
    <rect x="13" y="3.4" width="7.6" height="7.6" rx="2.4" />
    <rect x="3.4" y="13" width="7.6" height="7.6" rx="2.4" />
    <rect x="13" y="13" width="7.6" height="7.6" rx="2.4" />
  </svg>
);

export const CartIcon = ({ size, strokeWidth, filled }: IconProps & { filled?: boolean }) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M2.5 3h2.2l1.2 7.3h13.4l1.5-5.8H6.2" fill="none" />
    <path
      d="M5.9 10.3h13.4l-1 4.1a1.9 1.9 0 0 1-1.85 1.45H8.4a1.9 1.9 0 0 1-1.86-1.52Z"
      fill={filled ? "currentColor" : "none"}
    />
    <circle cx="9.5" cy="20" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="20" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const ReceiptIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M6 2.5h12v19l-2.3-1.5L13.6 21l-1.6-1.5L10.4 21l-2.1-1L6 21.5Z" />
    <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
  </svg>
);

export const UserIcon = ({ size, strokeWidth, filled }: IconProps & { filled?: boolean }) => (
  <svg {...base(size, strokeWidth)} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : strokeWidth}>
    <circle cx="12" cy="7.8" r="3.8" />
    <path d="M4 20.2c1.1-4.2 4.2-6.4 8-6.4s6.9 2.2 8 6.4a1 1 0 0 1-1 1.3H5a1 1 0 0 1-1-1.3Z" />
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

export const LeafIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M5 19c-1-6 1-12 7-15 6-2 10 1 11 6-3 8-11 10-18 9Z" />
    <path d="M6 18c4-5 8-8 14-11" />
  </svg>
);

export const CameraIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-2h6.6l1.2 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
    <circle cx="12" cy="13" r="3.6" />
  </svg>
);

export const UploadCloudIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M7 18a4.5 4.5 0 0 1-1-8.9 5.5 5.5 0 0 1 10.6-1.8A4 4 0 0 1 17 18Z" />
    <path d="M12 10.5v7M9 13.2l3-3 3 3" />
  </svg>
);

export const AlertIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 3.5 21 19H3Z" />
    <path d="M12 9.5v4.2" />
    <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const InfoIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const MapPinIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.6" />
  </svg>
);

export const MessageIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M4 5.5h16v11H9.5L5 20v-3.5H4Z" />
  </svg>
);

export const BanknoteIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M5.5 9v0M18.5 15v0" />
  </svg>
);

export const FlaskIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M10 3h4M10.5 3v6l-5 9.3a1.6 1.6 0 0 0 1.4 2.4h10.2a1.6 1.6 0 0 0 1.4-2.4l-5-9.3V3" />
    <path d="M8 15h8" />
  </svg>
);

export const DropletIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M12 3.5s6.5 7 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 12 3.5 12 3.5Z" />
  </svg>
);

export const CpuIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <rect x="6" y="6" width="12" height="12" rx="2.4" />
    <rect x="9.3" y="9.3" width="5.4" height="5.4" rx="1" />
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
  </svg>
);

export const CylinderIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <ellipse cx="12" cy="6" rx="5.5" ry="2.5" />
    <path d="M6.5 6v12a5.5 2.5 0 0 0 11 0V6" />
    <path d="M6.5 12a5.5 2.5 0 0 0 11 0" />
  </svg>
);

export const WrenchIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <path d="M14.5 3.5a5 5 0 0 0-6.6 5.9L3.5 14.8a2 2 0 0 0 2.8 2.8l5.4-4.4a5 5 0 0 0 5.9-6.6l-3.3 3.3-2.6-.9-.9-2.6Z" />
  </svg>
);

export const GiftIcon = ({ size, strokeWidth, filled }: IconProps & { filled?: boolean }) => (
  <svg {...base(size, strokeWidth)}>
    <rect x="3.4" y="9.3" width="17.2" height="4.2" rx="1.3" fill={filled ? "currentColor" : "none"} />
    <rect x="4.9" y="13.5" width="14.2" height="7.7" rx="1.3" fill={filled ? "currentColor" : "none"} />
    {!filled && <path d="M12 9.3v11.9" />}
    <path d="M12 9.3C10.4 5.6 7.8 4.5 6.4 5.9c-1.4 1.4.2 3.4 5.6 3.4Z" />
    <path d="M12 9.3c1.6-3.7 4.2-4.8 5.6-3.4 1.4 1.4-.2 3.4-5.6 3.4Z" />
  </svg>
);

export const TargetIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const LockIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);

export const ClockIcon = ({ size, strokeWidth }: IconProps) => (
  <svg {...base(size, strokeWidth)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3.2 2" />
  </svg>
);
