import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { fetchKnowledgeBase } from "@/lib/api";
import { DocumentStat } from "@/types/chat";

interface SourcesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function getVariantColor(variant: string): "default" | "secondary" | "outline" {
  switch (variant.toLowerCase()) {
    case "outdoor":
      return "default";
    case "indoor":
      return "secondary";
    case "hockey5s":
      return "outline";
    default:
      return "default";
  }
}

export function SourcesDialog({ open, onOpenChange, children }: SourcesDialogProps) {
  const [documents, setDocuments] = useState<DocumentStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && documents.length === 0) {
      setIsLoading(true);
      setError(null);
      fetchKnowledgeBase()
        .then((data) => {
          setDocuments(data);
        })
        .catch(() => {
          setError("Failed to load sources");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, documents.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Knowledge Base Sources</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4">
          Documents currently indexed in the knowledge base.
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={`${doc.source_file}-${doc.variant}-${doc.country}`}>
                  <TableCell className="font-medium text-xs">
                    {doc.source_file}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVariantColor(doc.variant)}>
                      {doc.variant}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.country}</TableCell>
                  <TableCell className="text-right">{doc.chunk_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
