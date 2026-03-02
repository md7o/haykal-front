interface AnswerSuggestionsProps {
  suggestions?: Array<{ text: string; isVisible?: boolean }>;
  onSuggestionClick?: (text: string) => void;
}

export default function AnswerSuggestions({ suggestions, onSuggestionClick }: AnswerSuggestionsProps) {
  return (
    <div>
      {suggestions?.map(({ text, isVisible }, index) => (
        <div
          key={index}
          className={`mb-2 transition-transform duration-300 ease-out ${
            isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <div
            onClick={() => onSuggestionClick?.(text)}
            className="flex justify-start gap-2 sm:gap-3 text-sm sm:text-md max-w-3xl text-description/70 bg-card-main px-3 py-2 sm:px-6 sm:py-3 rounded-soft mt-2 cursor-pointer hover:bg-accent/10 hover:scale-99 transition-all duration-200"
          >
            <p className="text-accent/50 flex-shrink-0">{index + 1}.</p>
            {text}
          </div>
        </div>
      ))}
    </div>
  );
}
