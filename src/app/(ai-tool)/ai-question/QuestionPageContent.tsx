"use client";

import { useState } from "react";
import AiLayout from "@/components/pages/ai-studio/shared/LayoutAi";
import { questionsData } from "@/components/pages/ai-studio/shared/questions-config";
import AiMessages from "@/components/pages/ai-studio/questions/MessagesAi";
import AiInput from "@/components/pages/ai-studio/questions/InputAi";
import { createAiIdea } from "@/api/ai-api/idea-endpoints";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  question: string;
  text: string;
}

type PageType = "input" | "messages";

export default function QuestionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [currentPage, setCurrentPage] = useState<PageType>("input");
  const [, setCurrentIdeaId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const router = useRouter();

  const getCurrentQuestion = () => {
    const index = Math.min(messages.length, questionsData.length - 1);
    return questionsData[index];
  };

  const handleSend = async (skipInputCheck?: boolean) => {
    // If Get Started button clicked and not yet started
    if (skipInputCheck && !hasStarted) {
      setHasStarted(true);
      return;
    }

    // Handle regular message submission
    if (currentInput.trim() && !isSubmitting) {
      const currentQuestion = getCurrentQuestion();
      const newMessage: Message = {
        id: Date.now().toString(),
        question: currentQuestion.question,
        text: currentInput,
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setCurrentInput("");

      // Auto-save or submit when all questions are answered
      if (updatedMessages.length === questionsData.length) {
        await handleSubmitIdea(updatedMessages);
      }
    }
  };

  const handleSubmitIdea = async (messagesToSubmit: Message[]) => {
    setIsSubmitting(true);
    try {
      // Get project name from first answer (a1)
      const projectName = messagesToSubmit[0]?.text.slice(0, 50) || "Untitled Project";

      // Convert messages to answer data
      const answerData: Record<string, any> = {};
      messagesToSubmit.forEach((message) => {
        const question = questionsData.find((q) => q.question === message.question);
        if (question) {
          const key = `${question.id}_${question.title.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
          answerData[key] = message.text;
        }
      });

      const result = await createAiIdea(projectName, answerData);
      setCurrentIdeaId(result.id);

      router.push(`/ai-response/${result.id}`);
      alert("Success! Your idea has been saved and is ready for AI analysis.");
    } catch (error) {
      console.error("Failed to save idea:", error);
      alert("Failed to save your idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AiLayout>
      {currentPage === "input" ? (
        <AiInput
          messages={messages}
          currentInput={currentInput}
          onInputChange={setCurrentInput}
          onSend={handleSend}
          onNavigateToMessages={() => setCurrentPage("messages")}
          isSubmitting={isSubmitting}
          hasStarted={hasStarted}
        />
      ) : (
        <AiMessages
          messages={messages}
          onEdit={(id, text) => {
            setEditingId(id);
            setEditingText(text);
          }}
          editingId={editingId}
          editingText={editingText}
          onEditChange={setEditingText}
          onSaveEdit={() => {
            setMessages(messages.map((m) => (m.id === editingId ? { ...m, text: editingText } : m)));
            setEditingId(null);
          }}
          onCancelEdit={() => setEditingId(null)}
          onNavigateToInput={() => setCurrentPage("input")}
        />
      )}
    </AiLayout>
  );
}
