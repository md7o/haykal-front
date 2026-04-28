"use client";

import { Brain, Send } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import { questionsData, getTotalQuestions, getProgressPercentage } from "../components/questions-config";
import AnswerSuggestions from "./AnswerSuggestions";
import AiLoadingScreen from "@/components/ui/custom_ui/AiLoadingScreen";

interface Message {
  id: string;
  question: string;
  text: string;
}

interface AiInputProps {
  messages: Message[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onSend: (skipInputCheck?: boolean) => void;
  onNavigateToMessages: () => void;
  isSubmitting?: boolean;
  hasStarted?: boolean;
}

const suggestionsByQuestion: Record<string, string[]> = {
  a1: [
    "Helps small businesses design products before making them",
    "Makes creating products easy with simple tools",
    "Saves money by skipping expensive design software",
  ],
  a2: ["Small online store owners", "Clothing designers selling online", "Print-on-demand business owners"],
  a3: [
    "See 3D designs without learning hard software",
    "Check how products look before paying to make them",
    "Change colors and materials instantly",
  ],
  b1: [
    "View products in 3D and change their colors",
    "Pick different materials and product types",
    "Add your own pictures and shapes",
  ],
  b2: [
    "Yes, you need an account to save your work",
    "Accounts let you see your designs on any device",
    "Keeps your design history and choices safe",
  ],
  b3: [
    "Charge a monthly fee for regular users",
    "Offer different prices based on how much people use it",
    "Charge extra for advanced design tools",
  ],
  b4: [
    "Mostly a tool for designing and changing products",
    "Includes a help center with design tips",
    "Step-by-step guides for new users",
  ],
  c1: ["Clean and simple screen layout", "Easy drag-and-drop controls", "Smooth menus that work well on phones and computers"],
  c2: [
    "Start with a small test group of 100 to 500 users",
    "Grow to over 1,000 users in the first few months",
    "Focus on finding eager online sellers first",
  ],
  c3: [
    "Use social media and online groups to find customers",
    "Team up with popular online store builders",
    "Give rewards to users who invite their friends",
  ],
  d1: [
    "Use standard web tools like React and Node.js",
    "Host the app online using AWS or Azure",
    "Add smart AI features to help with design",
  ],
  d2: [
    "Build the most important parts first, then add more later",
    "Make small updates quickly based on what users want",
    "Focus on making the app fast and easy to use",
  ],
  d3: [
    "Ask users what they think using quick surveys",
    "Look at how people use the app to find out what is broken",
    "Keep updating the app based on what you learn",
  ],
};

export default function AiInput({
  messages,
  currentInput,
  onInputChange,
  onSend,
  onNavigateToMessages,
  isSubmitting,
  hasStarted,
}: AiInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const totalQuestions = getTotalQuestions();
  const [visibleSuggestionsCount, setVisibleSuggestionsCount] = useState(0);

  const currentQuestion = questionsData[Math.min(messages.length, questionsData.length - 1)];
  const currentSuggestions = suggestionsByQuestion[currentQuestion.id];

  useEffect(() => {
    if (hasStarted) {
      setVisibleSuggestionsCount(0);
      const delays = currentSuggestions.map((_, index) =>
        setTimeout(
          () => {
            setVisibleSuggestionsCount((prev) => Math.min(prev + 1, currentSuggestions.length));
          },
          100 + index * 150,
        ),
      );
      return () => delays.forEach(clearTimeout);
    }
  }, [hasStarted, messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {isSubmitting && <AiLoadingScreen />}
      {hasStarted && (
        <div className="flex items-center justify-between p-2 sm:p-4 border-b border-light-border gap-2">
          <div></div>

          {/* Question Progress Circles */}
          <div className="flex flex-wrap gap-0 items-center">
            {questionsData.map((question, index) => {
              const isCurrentQuestion = index === messages.length;
              const isCompleted = index < messages.length;
              const isLastQuestion = index === questionsData.length - 1;

              return (
                <div key={question.id} className="sm:flex items-center hidden ">
                  <div
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs transition-all duration-300 flex-shrink-0 ${
                      isCurrentQuestion
                        ? "bg-accent text-title ring-2 ring-accent"
                        : isCompleted
                          ? "bg-accent text-title"
                          : "bg-description/30 text-description cursor-default"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {!isLastQuestion && (
                    <div
                      className={`h-1 rounded-full w-2 sm:w-3 transition-all duration-300 ${isCompleted ? "bg-accent" : "bg-description/30"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={onNavigateToMessages} variant="grayFill" className="font-normal text-xs sm:text-sm px-2 sm:px-3">
            <span className="hidden sm:inline">View Responses ({messages.length})</span>
            <span className="sm:hidden">Responses ({messages.length})</span>
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-0 items-center justify-center p-4 sm:hidden">
        {questionsData.map((question, index) => {
          const isCurrentQuestion = index === messages.length;
          const isCompleted = index < messages.length;
          const isLastQuestion = index === questionsData.length - 1;

          return (
            <div key={question.id} className="sm:hidden flex items-center justify-center">
              <div
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs transition-all duration-300 flex-shrink-0 ${
                  isCurrentQuestion
                    ? "bg-accent text-title ring-2 ring-accent"
                    : isCompleted
                      ? "bg-accent text-title"
                      : "bg-description/30 text-description cursor-default"
                }`}
              >
                {index + 1}
              </div>
              {!isLastQuestion && (
                <div
                  className={`h-1 rounded-full w-2 sm:w-3 transition-all duration-300 ${isCompleted ? "bg-accent" : "bg-description/30"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Input Area */}
      <div className="flex flex-col items-center p-2 sm:p-4 transition-all duration-500 flex-1 justify-center">
        <div className="w-full max-w-3xl space-y-3 sm:space-y-5">
          {!hasStarted && messages.length === 0 ? (
            <div className="text-center mb-4 sm:mb-8">
              <h1 className="text-xl sm:text-3xl text-title mb-2">Turn your idea into a technical plan</h1>
              <p className="text-description text-sm sm:text-base">Describe your project idea and get a full plan with AI</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 text-base sm:text-xl pt-0 text-left max-w-2xl">
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-accent text-title flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                  {messages.length + 1}
                </span>
                {currentQuestion?.question}
              </div>
            </div>
          )}

          <div className="flex justify-center items-center gap-2 sm:gap-5">
            <div className={`w-full ${hasStarted ? "bg-card-main p-2 rounded-strong" : "text-center"}`}>
              {!hasStarted && messages.length === 0 ? (
                <Button size="large" onClick={() => onSend(true)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </Button>
              ) : (
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={currentInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    className="resize-none min-h-[60px] sm:min-h-[70px] w-full text-sm sm:text-base md:text-lg ring-0 focus:ring-0"
                  />
                  <div className="text-right p-1 sm:p-2">
                    <Button
                      size="icon"
                      onClick={() => onSend()}
                      disabled={!currentInput.trim() || isSubmitting}
                      className="bg-transparent disabled:scale-100 scale-130"
                    >
                      {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <div className="relative hidden sm:flex flex-col items-center gap-1 sm:gap-2">
                <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-description"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(messages.length / totalQuestions) * 282.74} 282.74`}
                      className="text-accent transition-all duration-300"
                    />
                  </svg>
                  <Brain className="absolute inset-0 m-auto w-5 h-5 sm:w-8 sm:h-8 text-title" />
                </div>
                <p className="text-xs sm:text-sm text-title">{getProgressPercentage(messages.length, totalQuestions)}%</p>
              </div>
            )}
          </div>

          {hasStarted && (
            <AnswerSuggestions
              suggestions={currentSuggestions.map((text, index) => ({
                text,
                isVisible: index < visibleSuggestionsCount,
              }))}
              onSuggestionClick={onInputChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
