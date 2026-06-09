'use client'

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 border border-border">
        <Monitor className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">切换主题</span>
      </Button>
    )
  }

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4 text-foreground" />
    }
    if (theme === "dark") {
      return <Moon className="h-4 w-4 text-foreground" />
    }
    return <Sun className="h-4 w-4 text-accent" />
  }

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("system")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 border border-border hover:border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={cycleTheme}
      title={`当前主题: ${theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色模式' : '明亮模式'}`}
    >
      {getIcon()}
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
