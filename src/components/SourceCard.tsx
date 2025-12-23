import { useState } from "react";
import { SourceDoc } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

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
    <div className="py-3 border-b border-border/30 last:border-b-0">
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="font-medium text-sm text-foreground">
          {header || `Source ${index + 1}`}
        </p>
      </div>

      {/* Metadata pills */}
      <div className="flex flex-wrap gap-1.5 mb-2 ml-6">
        {metadata.variant && (
          <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
            {metadata.variant}
          </Badge>
        )}
        {metadata.page && (
          <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
            Page {metadata.page}
          </Badge>
        )}
        {metadata.section && (
          <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
            § {metadata.section}
          </Badge>
        )}
        {metadata.rule_number && (
          <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
            Rule {metadata.rule_number}
          </Badge>
        )}
        {metadata.source_file && (
          <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
            {metadata.source_file}
          </Badge>
        )}
      </div>

      {/* Summary */}
      {metadata.summary && (
        <p className="text-xs text-muted-foreground italic mb-2 ml-6 line-clamp-2">
          {metadata.summary}
        </p>
      )}

      {/* Content */}
      <div className="ml-6">
        <p className={`text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-3"}`}>
          {doc.page_content}
        </p>
        {hasExpandableContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-xs text-muted-foreground hover:text-foreground px-0 mt-1"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
