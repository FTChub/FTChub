import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 w-full"
        >
            {theme === "dark" ? (
                <>
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                </>
            ) : (
                <>
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                </>
            )}
        </button>
    )
}
