import { useState } from "react";
import { ChatMessage } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
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
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground px-2">
          <FileText className="w-4 h-4" />
          <span>Debug info{sourceCount > 0 ? ` • ${sourceCount} source${sourceCount !== 1 ? "s" : ""}` : ""}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card className="p-3 bg-muted/50 border-border space-y-3">
          {/* Standalone query */}
          {message.standalone_query && (
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">Query: </span>
                <span className="text-sm text-foreground">{message.standalone_query}</span>
              </div>
            </div>
          )}

          {/* Timing and variant badges */}
          <div className="flex flex-wrap items-center gap-2">
            {message.responseTime && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="w-3 h-3" />
                {formatTime(message.responseTime)}
              </Badge>
            )}
            {message.variant && (
              <Badge variant="outline" className="capitalize text-xs">
                {message.variant}
              </Badge>
            )}
          </div>

          {/* Sources */}
          {message.source_docs && message.source_docs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-medium">Sources</p>
              {message.source_docs.map((doc, index) => (
                <SourceCard key={index} doc={doc} index={index} />
              ))}
            </div>
          )}
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
