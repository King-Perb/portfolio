"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface TechnologyCardProps {
  name: string;
}

export function TechnologyCard({ name }: TechnologyCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground font-mono group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
