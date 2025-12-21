import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Circle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

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
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">FIH Rules AI</h1>
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Circle
            className={`w-2 h-2 ${
              isHealthy === null
                ? "fill-muted-foreground text-muted-foreground"
                : isHealthy
                ? "fill-green-500 text-green-500"
                : "fill-destructive text-destructive"
            }`}
          />
          {isHealthy === null ? "Checking..." : isHealthy ? "Online" : "Offline"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onNewChat} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Chat
        </Button>
      </div>
    </header>
  );
}
