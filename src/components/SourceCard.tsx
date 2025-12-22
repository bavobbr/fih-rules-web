import { useState } from "react";
import { SourceDoc } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, BookOpen, FileText } from "lucide-react";

interface SourceCardProps {
  doc: SourceDoc;
  index: number;
}

export function SourceCard({ doc, index }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { metadata } = doc;

  const header = [metadata.chapter, metadata.heading].filter(Boolean).join(" • ");
  const hasExpandableContent = doc.page_content.length > 200;

  return (
    <Card className="p-3 bg-background border-border">
      {/* Header with chapter + heading */}
      <div className="flex items-start gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {header ? (
            <p className="font-medium text-sm text-foreground truncate">{header}</p>
          ) : (
            <p className="font-medium text-sm text-muted-foreground">Source {index + 1}</p>
          )}
        </div>
      </div>

      {/* Metadata badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {metadata.variant && (
          <Badge variant="outline" className="text-xs">
            {metadata.variant}
          </Badge>
        )}
        {metadata.page && (
          <Badge variant="outline" className="text-xs">
            Page {metadata.page}
          </Badge>
        )}
        {metadata.section && (
          <Badge variant="outline" className="text-xs">
            § {metadata.section}
          </Badge>
        )}
        {metadata.rule_number && (
          <Badge variant="outline" className="text-xs">
            Rule {metadata.rule_number}
          </Badge>
        )}
        {metadata.source_file && (
          <Badge variant="secondary" className="text-xs gap-1">
            <FileText className="w-3 h-3" />
            {metadata.source_file}
          </Badge>
        )}
      </div>

      {/* Summary if available */}
      {metadata.summary && (
        <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">
          {metadata.summary}
        </p>
      )}

      {/* Content with expand/collapse */}
      <div className="relative">
        <p className={`text-sm text-foreground/80 ${isExpanded ? "" : "line-clamp-3"}`}>
          {doc.page_content}
        </p>
        {hasExpandableContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-xs text-primary hover:text-primary/80 px-2 mt-1"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Show full <ChevronDown className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
