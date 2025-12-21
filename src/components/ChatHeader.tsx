import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Circle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  onNewChat: () => void;
  isHealthy: boolean | null;
}

export function ChatHeader({ onNewChat, isHealthy }: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between px-3 py-2 md:px-4 md:py-4 [background:var(--gradient-header)] text-white shadow-lg">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="text-white/90 hover:text-white hover:bg-white/10" />
        <h1 className="text-base md:text-xl font-bold">FIH Rules AI</h1>
        <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 bg-white/20 text-white border-white/30">
          <Circle
            className={`w-2 h-2 ${
              isHealthy === null
                ? "fill-white/50 text-white/50"
                : isHealthy
                ? "fill-green-400 text-green-400"
                : "fill-red-400 text-red-400"
            }`}
          />
          {isHealthy === null ? "Checking..." : isHealthy ? "Online" : "Offline"}
        </Badge>
        {/* Mobile-only status dot */}
        <Circle
          className={`w-2 h-2 sm:hidden ${
            isHealthy === null
              ? "fill-white/50 text-white/50"
              : isHealthy
              ? "fill-green-400 text-green-400"
              : "fill-red-400 text-red-400"
          }`}
        />
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 md:h-9 md:w-9 text-white/90 hover:text-white hover:bg-white/10">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewChat} className="h-8 w-8 md:hidden text-white/90 hover:text-white hover:bg-white/10">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onNewChat} className="hidden md:flex gap-2 text-white/90 hover:text-white hover:bg-white/10">
          <RotateCcw className="w-4 h-4" />
          New Chat
        </Button>
      </div>
    </header>
  );
}
