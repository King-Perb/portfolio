"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export function EasterEggButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto border-[var(--neon-red)]/30 text-[var(--neon-red)] hover:border-[var(--neon-red)]/50 hover:text-[var(--neon-red)] hover:brightness-110 hover:bg-[var(--neon-red)]/10 font-mono text-sm transition-all"
        >
          <AlertTriangle className="size-4" />
          Don&apos;t Click This
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-card/95 backdrop-blur border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Portfolio Presentation</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-primary/20">
          <video
            className="w-full h-full object-contain"
            controls
            autoPlay
            src="/Portfolio_Presentation.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  )
}

