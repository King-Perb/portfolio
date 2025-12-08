"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_METRICS } from "@/data/mock-data";
import type { Metric } from "@/types";

export function OverviewMetrics() {
    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MOCK_METRICS.map((metric: Metric, index: number) => (
                <Card key={index} className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground font-mono">
                            {metric.label.toUpperCase()}
                        </CardTitle>
                        <metric.icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                            {metric.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                            <span className={cn(
                                "mr-1",
                                metric.trend === "up" ? "text-primary" : "text-muted-foreground"
                            )}>
                                {metric.subtext.split(" ")[0]}
                            </span>
                            {metric.subtext.split(" ").slice(1).join(" ")}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
