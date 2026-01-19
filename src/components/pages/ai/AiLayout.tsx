"use client";

import { Edit, Send } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui-tools/ui/button";
import { Textarea } from "@/components/ui-tools/ui/textarea";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui-tools/ui/sidebar";
import AiSidebar from "./AiSidebar";

interface Message {
  id: string;
  question: string;
  text: string;
}

function MainContent() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" || isMobile;
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (currentInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        question: getCurrentQuestion(),
        text: currentInput,
      };
      setMessages([...messages, newMessage]);
      setCurrentInput("");

      // Focus on new textarea after state update
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSend();
    }
  };

  const handleEditStart = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleEditSave = (id: string) => {
    setMessages(messages.map((msg) => (msg.id === id ? { ...msg, text: editingText } : msg)));
    setEditingId(null);
    setEditingText("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText("");
  };

  const questions = [
    "What does the project name?",
    "What is the goal from the idea?",
    "Who is your target audience?",
    "What are the key features you want to implement?",
    "What technology stack do you prefer?",
  ];

  const getCurrentQuestion = () => {
    const index = Math.min(messages.length, questions.length - 1);
    return questions[index];
  };

  return (
    <main className="flex-1 flex flex-col bg-card-bg">
      {/* Mobile/Collapsed Header with Trigger and Edit Button */}
      {isCollapsed && (
        <div className="flex items-center gap-2 animate-in fade-in duration-1000 absolute top-0 left-0 p-2">
          <Button variant="grayFill" size="icon" asChild>
            <SidebarTrigger />
          </Button>
          <Button variant="grayFill" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Previous Messages - scroll area at top */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length > 0 && (
            <div className="w-full max-w-2xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card-main rounded-lg ">
                    {/* Question at top */}
                    <p className="font-bold p-3 bg-accent rounded-t-soft">Q: {message.question}</p>

                    {editingId === message.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="resize-none min-h-24"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={handleEditCancel}>
                            Cancel
                          </Button>
                          <Button variant="fill" onClick={() => handleEditSave(message.id)}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4 p-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{message.text}</p>
                        <Button variant="transparent" onClick={() => handleEditStart(message.id, message.text)}>
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Input Area - centered in middle */}
        <div className=" flex items-center justify-center h-screen p-4">
          <div className="w-full max-w-2xl space-y-6">
            {/* Question Prompt */}
            {messages.length === 0 ? (
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Turn your idea into a technical plan</h1>
                <p className="text-sm text-description">
                  Describe your project idea in a few sentences and get a full technical plan with AI
                </p>
              </div>
            ) : (
              <p className="text-center text-base text-foreground animate-in slide-in-from-bottom-4 duration-500">
                {getCurrentQuestion()}
              </p>
            )}

            {/* Current Input Textarea */}
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <Textarea
                ref={textareaRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messages.length === 0 ? "Describe your project idea..." : "Type your answer..."}
                className="resize-none rounded-bl-none rounded-br-none focus:ring-0"
              />
              <div className="flex justify-end items-center rounded-br-soft rounded-bl-soft bg-card-main p-2">
                <Button variant="fill" size="icon" onClick={handleSend} disabled={!currentInput.trim()}>
                  <Send />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AiLayout() {
  return (
    <SidebarProvider className="" style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <div className="flex w-full min-h-screen">
        <AiSidebar activeItem="feed" slug="ai" isOwner={false} />
        <MainContent />
      </div>
    </SidebarProvider>
  );
}
