export type WheelSegment = {
  type: "discount" | "points" | "none";
  value: number;
  label: string;
  weight: number;
};

// Order matters — the client renders the same 8 segments in this order.
export const WHEEL_SEGMENTS: WheelSegment[] = [
  { type: "discount", value: 5, label: "-5%", weight: 20 },
  { type: "points", value: 50, label: "50 баллов", weight: 18 },
  { type: "discount", value: 10, label: "-10%", weight: 14 },
  { type: "none", value: 0, label: "Не повезло", weight: 16 },
  { type: "discount", value: 15, label: "-15%", weight: 8 },
  { type: "points", value: 100, label: "100 баллов", weight: 6 },
  { type: "discount", value: 20, label: "-20%", weight: 3 },
  { type: "points", value: 20, label: "20 баллов", weight: 15 },
];

export function pickWeightedSegment(): number {
  const total = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    roll -= WHEEL_SEGMENTS[i].weight;
    if (roll <= 0) return i;
  }
  return WHEEL_SEGMENTS.length - 1;
}
