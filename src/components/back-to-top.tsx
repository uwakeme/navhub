'use client'

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const shouldShow = scrollY > 300
      setIsVisible(shouldShow)
      
      // Add subtle animation when scrolling
      if (scrollY > 0) {
        setIsScrolling(true)
        const timer = setTimeout(() => setIsScrolling(false), 150)
        return () => clearTimeout(timer)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-lg transition-all duration-300",
        "hover:scale-110 hover:shadow-xl",
        isScrolling && "animate-in fade-in slide-in-from-bottom-2"
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}
