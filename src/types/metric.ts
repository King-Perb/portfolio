import { LucideIcon } from "lucide-react";

export type TrendType = "up" | "down" | "neutral";

export interface Metric {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  trend: TrendType;
}

