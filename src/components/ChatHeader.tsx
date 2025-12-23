import { Button } from "@/components/ui/button";
import { Circle, Moon, Sun, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  onNewChat: () => void;
  isHealthy: boolean | null;
  onAboutClick?: () => void;
}

export function ChatHeader({ onNewChat, isHealthy, onAboutClick }: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted" />
        <Link 
          to="/" 
          onClick={onNewChat}
          className="text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          Field Hockey Rule AI
        </Link>
        <Circle
          className={`w-2 h-2 ${
            isHealthy === null
              ? "fill-muted-foreground/50 text-muted-foreground/50"
              : isHealthy
              ? "fill-green-500 text-green-500"
              : "fill-red-500 text-red-500"
          }`}
        />
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onAboutClick}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">About</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
