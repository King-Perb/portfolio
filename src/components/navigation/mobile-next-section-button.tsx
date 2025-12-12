"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/lib/constants"
import { ArrowRight } from "lucide-react"
import { useNavigation } from "@/contexts/navigation-context"

export function MobileNextSectionButton() {
  const pathname = usePathname()
  const { triggerNavigation, isAnimating } = useNavigation()

  // Find current index in NAV_ITEMS
  const currentIndex = NAV_ITEMS.findIndex(item => item.href === pathname)

  // If not found, don't show button
  if (currentIndex === -1) {
    return null
  }

  // If on last page (Contact), show button to Overview (first page)
  // Otherwise, show button to next section
  const targetSection = currentIndex === NAV_ITEMS.length - 1
    ? NAV_ITEMS[0] // Overview
    : NAV_ITEMS[currentIndex + 1]

  const handleClick = () => {
    triggerNavigation(targetSection.href)
  }

  return (
    <div className="md:hidden flex justify-center pt-8 pb-4">
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={isAnimating}
        className="w-full border-primary/30 text-primary hover:border-primary/50 hover:text-primary hover:brightness-110 hover:bg-primary/10 font-mono text-sm transition-all disabled:opacity-50"
      >
        {targetSection.label}
        <ArrowRight className="size-4 ml-2" />
      </Button>
    </div>
  )
}
