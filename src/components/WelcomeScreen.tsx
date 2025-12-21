import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Trophy,
  MessageCircleQuestion
} from "lucide-react";

interface WelcomeScreenProps {
  onExampleClick: (question: string) => void;
}

const exampleQuestions = [
  "Can I hit the ball in indoor hockey?",
  "What is the penalty for a deliberate foul in the circle?",
  "How long is a green card suspension?",
  "What are the differences between outdoor and indoor rules?",
];

const features = [
  {
    icon: Target,
    title: "Umpires",
    description: "Quick rule checks between matches",
  },
  {
    icon: Users,
    title: "Coaches & Players",
    description: "Ensure strategies are rule-compliant",
  },
  {
    icon: Trophy,
    title: "Fans & Commentators",
    description: "Understand umpiring decisions instantly",
  },
];

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <MessageCircleQuestion className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            FIH Rules AI Agent
          </h1>
          <p className="text-muted-foreground text-lg">
            Your Digital Umpire's Assistant for instant, expert-level clarity on International Hockey Federation rules.
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary">Outdoor</Badge>
            <Badge variant="secondary">Indoor</Badge>
            <Badge variant="secondary">Hockey5s</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="p-4 bg-card">
              <feature.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Try asking:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleQuestions.map((question) => (
              <button
                key={question}
                onClick={() => onExampleClick(question)}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
