import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Circle } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
  isHealthy: boolean | null;
}

export function ChatHeader({ onNewChat, isHealthy }: ChatHeaderProps) {
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
      <Button variant="ghost" size="sm" onClick={onNewChat} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        New Chat
      </Button>
    </header>
  );
}
