import { Badge } from "@/components/ui/badge";
import { 
  CircleHelp,
  Scale,
  Clock,
  Shuffle
} from "lucide-react";

interface WelcomeScreenProps {
  onExampleClick: (question: string) => void;
}

const suggestions = [
  {
    icon: CircleHelp,
    title: "Explain a rule",
    question: "What is the penalty for a deliberate foul in the circle?",
  },
  {
    icon: Scale,
    title: "Compare variants",
    question: "What are the differences between outdoor and indoor rules?",
  },
  {
    icon: Clock,
    title: "Card suspensions",
    question: "How long is a green card suspension?",
  },
  {
    icon: Shuffle,
    title: "Quick check",
    question: "Can I hit the ball in indoor hockey?",
  },
];

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
      <div className="max-w-2xl w-full space-y-8 md:space-y-12">
        {/* Main heading */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-foreground">
            What can I help with?
          </h1>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="text-xs font-normal">Outdoor</Badge>
            <Badge variant="secondary" className="text-xs font-normal">Indoor</Badge>
            <Badge variant="secondary" className="text-xs font-normal">Hockey5s</Badge>
          </div>
        </div>

        {/* 2x2 suggestion grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              onClick={() => onExampleClick(suggestion.question)}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-background transition-colors">
                <suggestion.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {suggestion.question}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
