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
    "It helps small businesses design and visualize custom products before production",
    "It streamlines the product creation process with an intuitive design interface",
    "It reduces design costs by eliminating the need for expensive software",
  ],
  a2: [
    "E-commerce entrepreneurs and small business owners",
    "Fashion designers exploring online sales",
    "Print-on-demand business operators",
  ],
  a3: [
    "Design products with a 3D preview without learning complex software",
    "Create and visualize designs before committing to production",
    "Customize product colors, materials, and shapes in real-time",
  ],
  b1: [
    "Product 3D visualization and color customization",
    "Product material and type selection",
    "Add images and shapes to designs",
  ],
  b2: [
    "Yes, users need accounts to save their designs",
    "Accounts allow users to access their designs across devices",
    "User data storage for design history and preferences",
  ],
  b3: [
    "Monthly subscription model for regular users",
    "Tiered pricing based on features and design uploads",
    "Premium features for advanced customization options",
  ],
  b4: [
    "Primarily a tool for product design and customization",
    "Could include a help center and design tips",
    "Tutorial resources for new users",
  ],
  c1: [
    "Modern and minimalist design interfaces",
    "Intuitive drag-and-drop functionality",
    "Smooth animations and responsive layout",
  ],
  c2: [
    "Start with a beta group of 100-500 users",
    "Gradually scale to 1,000+ users within first quarter",
    "Target early adopters in e-commerce community",
  ],
  c3: [
    "Use social media and online communities for marketing",
    "Partner with e-commerce platforms for integration",
    "Offer referral incentives to grow user base",
  ],
  d1: [
    "Use React for frontend and Node.js for backend",
    "Leverage cloud services like AWS or Azure for hosting",
    "Implement AI features with TensorFlow or PyTorch",
  ],
  d2: [
    "Focus on core features first, then expand based on user feedback",
    "Iterate quickly with agile development practices",
    "Prioritize user experience and performance optimization",
  ],
  d3: [
    "Gather user feedback through surveys and interviews",
    "Analyze usage data to identify pain points and opportunities",
    "Continuously improve the product based on insights",
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
