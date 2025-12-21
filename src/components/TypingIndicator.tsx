export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
