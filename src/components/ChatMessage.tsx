import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Bot, ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <Card
          className={`px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground"
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </Card>

        {!isUser && !message.isLoading && (message.variant || message.source_docs?.length) && (
          <div className="flex flex-wrap items-center gap-2">
            {message.variant && (
              <Badge variant="secondary" className="capitalize">
                {message.variant}
              </Badge>
            )}

            {message.source_docs && message.source_docs.length > 0 && (
              <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    {message.source_docs.length} source{message.source_docs.length !== 1 ? "s" : ""}
                    {isSourcesOpen ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="space-y-2">
                    {message.source_docs.map((doc, index) => (
                      <Card key={index} className="p-3 bg-muted/50">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {doc.metadata.variant && (
                            <Badge variant="outline" className="text-xs">
                              {String(doc.metadata.variant)}
                            </Badge>
                          )}
                          {doc.metadata.page && (
                            <Badge variant="outline" className="text-xs">
                              Page {String(doc.metadata.page)}
                            </Badge>
                          )}
                          {doc.metadata.rule_number && (
                            <Badge variant="outline" className="text-xs">
                              Rule {String(doc.metadata.rule_number)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {doc.page_content}
                        </p>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
