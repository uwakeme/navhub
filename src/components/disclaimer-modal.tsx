'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations } from "next-intl"

const DISCLAIMER_KEY = "navhub_disclaimer_accepted"
const DISCLAIMER_VERSION = "1.0"

export function DisclaimerModal() {
  const [open, setOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const t = useTranslations("Disclaimer")

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY)
    const acceptedVersion = localStorage.getItem(`${DISCLAIMER_KEY}_version`)

    // Show disclaimer if not accepted or version changed
    if (accepted !== "true" || acceptedVersion !== DISCLAIMER_VERSION) {
      // Small delay to ensure smooth page load
      const timer = setTimeout(() => setOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    if (dontShowAgain) {
      localStorage.setItem(DISCLAIMER_KEY, "true")
      localStorage.setItem(`${DISCLAIMER_KEY}_version`, DISCLAIMER_VERSION)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            <span className="text-accent">{'//'}</span> notice
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight font-mono">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed font-mono">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed font-mono">
          <div>
            <h3 className="font-bold mb-2 uppercase tracking-widest text-xs">
              <span className="text-accent">▸</span> {t("contentTitle")}
            </h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>{`// ${t("point1")}`}</li>
              <li>{`// ${t("point2")}`}</li>
              <li>{`// ${t("point3")}`}</li>
              <li>{`// ${t("point4")}`}</li>
            </ul>
          </div>

          <div className="p-3 border border-border bg-muted text-xs text-muted-foreground font-mono italic">
            <span className="text-accent">$</span> {t("lastUpdated")} {new Date().toLocaleDateString()}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-xs text-muted-foreground cursor-pointer font-mono uppercase tracking-widest"
            >
              {t("dontShowAgain")}
            </label>
          </div>
          <Button
            onClick={handleAccept}
            className="w-full bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent font-mono uppercase tracking-widest"
          >
            {t("accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
