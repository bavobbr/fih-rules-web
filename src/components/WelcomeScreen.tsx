import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CircleHelp,
  Scale,
  Clock,
  Shuffle,
  ExternalLink
} from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { Country } from "@/types/chat";

interface WelcomeScreenProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  isLoadingCountries: boolean;
  onSend: (question: string) => void;
  onAboutClick?: () => void;
  disabled?: boolean;
}

const suggestions = [
  {
    icon: CircleHelp,
    title: "Explain a rule",
    question: "What is the penalty for a deliberate foul in the circle?",
  },
  {
    icon: Scale,
    title: "Check rules",
    question: "What is rule 13.2?",
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

export function WelcomeScreen({
  countries,
  selectedCountry,
  onCountryChange,
  isLoadingCountries,
  onSend,
  onAboutClick,
  disabled
}: WelcomeScreenProps) {

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
      <div className="max-w-2xl w-full space-y-6 md:space-y-8">
        {/* Main heading */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">
            What can I help with?
          </h1>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">Outdoor</Badge>
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">Indoor</Badge>
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1">Hockey5s</Badge>
          </div>
        </div>

        {/* Country selector */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            <Select
              value={selectedCountry}
              onValueChange={onCountryChange}
              disabled={isLoadingCountries}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="international">International</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Centered input */}
        <ChatInput onSend={onSend} disabled={disabled} />

        {/* 2x2 suggestion grid - show 2 on mobile, 4 on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.title}
              onClick={() => onSend(suggestion.question)}
              className={`flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group ${
                index >= 2 ? 'hidden sm:flex' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-background transition-colors">
                <suggestion.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-foreground">{suggestion.title}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {suggestion.question}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Attribution Footer */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Based on{" "}
            <a
              href="https://www.fih.hockey/about-fih/official-documents/rules-of-hockey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              official FIH rules
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
          <button
            onClick={onAboutClick}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About & Disclaimers
          </button>
        </div>
      </div>
    </div>
  );
}
