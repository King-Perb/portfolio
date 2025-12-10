"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { cn } from "@/lib/utils";

interface StackCardProps {
  language: string;
  bytes: number;
  totalBytes: number;
  index: number;
}

export function StackCard({ language, bytes, totalBytes, index }: StackCardProps) {
  const percentage = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0;

  // Use chart color gradient from brand book
  const chartColors = [
    "oklch(0.50 0.12 145)", // Darker green
    "oklch(0.60 0.12 145)",
    "oklch(0.70 0.12 145)",
    "oklch(0.80 0.10 145)",
    "oklch(0.90 0.10 145)", // Lighter green
  ];

  const colorIndex = Math.min(index, chartColors.length - 1);
  const bgColor = chartColors[colorIndex];

  return (
    <Card className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground font-mono group-hover:text-primary transition-colors">
          {language}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground font-mono">
          <span>{percentage.toFixed(1)}%</span>
          <span className="text-xs">{(bytes / 1024).toFixed(1)} KB</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: bgColor,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
