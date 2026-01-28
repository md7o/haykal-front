"use client";

import { Brain, Send } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui-tools/ui/button";
import { Textarea } from "@/components/ui-tools/ui/textarea";
import { questionsData, getTotalQuestions, getProgressPercentage } from "../shared/questions-config";
import LoadingScreen from "@/components/ui-tools/custom_ui/LoadingScreen";

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

  const getCurrentQuestion = () => {
    const index = Math.min(messages.length, questionsData.length - 1);
    return questionsData[index];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (unless Shift is held for newline). Keep Ctrl+Enter working.
    if (e.key === "Enter") {
      if (e.shiftKey) return; // allow newline
      e.preventDefault();
      onSend();
      return;
    }

    if (e.key === "Enter" && e.ctrlKey) onSend();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Full Screen Loading Overlay */}
      {isSubmitting && <LoadingScreen />}
      {hasStarted && (
        <div className="flex items-center justify-between p-4 border-b border-light-border">
          <p className="text-sm  text-description">
            Responses: {messages.length} / {totalQuestions}
          </p>

          {/* Question Progress Circles */}
          <div className="flex flex-wrap gap-0  items-center">
            {questionsData.map((question, index) => {
              const isCurrentQuestion = index === messages.length;
              const isCompleted = index < messages.length;
              const isDisabled = index > messages.length;
              const isLastQuestion = index === questionsData.length - 1;

              return (
                <div key={question.id} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 flex-shrink-0 ${
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
                      className={`h-1 rounded-full w-3 mx-1 transition-all duration-300 ${isCompleted ? "bg-accent" : "bg-description/30"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={onNavigateToMessages} variant="grayFill" className="font-normal">
            View Responses ({messages.length})
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`flex flex-col items-center p-4 transition-all duration-500 
        ${!hasStarted && messages.length === 0 ? "flex-1 justify-center" : "flex-1 justify-center"}`}
      >
        <div className="w-full max-w-3xl space-y-5">
          {!hasStarted && messages.length === 0 ? (
            <div className="text-center mb-8">
              <h1 className="text-3xl  text-title mb-2">Turn your idea into a technical plan</h1>
              <p className="text-description">Describe your project idea and get a full plan with AI</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-xl pt-0 text-left max-w-2xl">
                <span className="w-7 h-7 rounded-full bg-accent text-title flex items-center justify-center text-sm flex-shrink-0">
                  {messages.length + 1}
                </span>
                {getCurrentQuestion()?.question}
              </div>
            </div>
          )}

          <div className="flex justify-center items-center gap-5">
            <div className={`w-full ${hasStarted ? "bg-card-main p-2  rounded-strong" : "text-center"}`}>
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
                    className="resize-none min-h-[70px] w-full md:text-lg ring-0 focus:ring-0 "
                  />
                  <div className="text-right p-2">
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
              <div className="relative flex flex-col items-center gap-2">
                {/* Circular Progress */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-description"
                    />
                    {/* Progress circle */}
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
                  {/* Center brain icon */}
                  <Brain className="absolute inset-0 m-auto w-8 h-8 text-title" />
                </div>
                {/* Progress percentage text */}
                <p className="text-sm text-title">{getProgressPercentage(messages.length, totalQuestions)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
