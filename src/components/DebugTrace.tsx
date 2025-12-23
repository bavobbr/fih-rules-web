import { useState } from "react";
import { ChatMessage } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Clock, ChevronDown, ChevronUp, Info } from "lucide-react";
import { SourceCard } from "./SourceCard";

interface DebugTraceProps {
  message: ChatMessage;
}

export function DebugTrace({ message }: DebugTraceProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasDebugInfo = message.standalone_query || message.responseTime || message.variant || message.source_docs?.length;

  if (!hasDebugInfo) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const sourceCount = message.source_docs?.length || 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 -ml-2"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Sources</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3 animate-fade-in">
        {/* Query and metadata */}
        <div className="space-y-2 pl-1">
          {message.standalone_query && (
            <div className="flex items-start gap-2 text-sm">
              <Search className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{message.standalone_query}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {message.responseTime && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                <Clock className="w-3 h-3" />
                {formatTime(message.responseTime)}
              </Badge>
            )}
            {message.variant && (
              <Badge variant="outline" className="capitalize text-xs font-normal">
                {message.variant}
              </Badge>
            )}
          </div>
        </div>

        {/* Sources */}
        {message.source_docs && message.source_docs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            {message.source_docs.map((doc, index) => (
              <SourceCard key={index} doc={doc} index={index} />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
