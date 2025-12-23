import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ExternalLink, 
  Github, 
  Linkedin, 
  FileText,
  AlertTriangle,
  Info
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AboutDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function AboutDialog({ open, onOpenChange, children }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">About FIH Rules AI</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Source Section */}
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Official Source</h3>
            <p className="text-muted-foreground">
              Rules are sourced from the official FIH (International Hockey Federation) documents.
            </p>
            <a
              href="https://www.fih.hockey/about-fih/official-documents/rules-of-hockey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              FIH Official Rules of Hockey
            </a>
          </section>

          <Separator />

          {/* Disclaimers Section */}
          <section className="space-y-3">
            <h3 className="font-semibold text-foreground">Disclaimers</h3>
            
            <div className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">AI Accuracy</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  This AI assistant provides best-effort interpretations. The AI might be wrong about specific rules. 
                  Any official discussion should be based on the original FIH documents.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">Third-Party Project</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  This is an independent project and is not affiliated with, endorsed by, or connected to 
                  FIH (International Hockey Federation). We provide a service on top of their publicly available documents.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Author Section */}
          <section className="space-y-3">
            <h3 className="font-semibold text-foreground">Created by Bavo Bruylandt</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://github.com/bavobbr/fih-rules-web"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Frontend Repo</span>
              </a>

              <a
                href="https://github.com/bavobbr/fih-rules-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Backend Repo</span>
              </a>

              <a
                href="https://medium.com/@bavo.bruylandt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Design Articles</span>
              </a>

              <a
                href="https://www.linkedin.com/in/bavobruylandt/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">LinkedIn</span>
              </a>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
