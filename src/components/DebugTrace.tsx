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
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const hasDebugInfo = message.standalone_query || message.responseTime || message.variant || message.source_docs?.length;

  if (!hasDebugInfo) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className="p-3 bg-muted/30 border-border/50">
      {/* Query and timing row */}
      <div className="space-y-2">
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
      </div>

      {/* Sources collapsible */}
      {message.source_docs && message.source_docs.length > 0 && (
        <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground w-full justify-start px-2 -mx-2">
              <FileText className="w-4 h-4" />
              <span>{message.source_docs.length} source{message.source_docs.length !== 1 ? "s" : ""}</span>
              {isSourcesOpen ? (
                <ChevronUp className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-auto" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {message.source_docs.map((doc, index) => (
                <SourceCard key={index} doc={doc} index={index} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
}
