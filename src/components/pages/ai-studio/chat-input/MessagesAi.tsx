"use client";

import { Button } from "@/components/ui/shadcn_ui/button";
import { Edit } from "lucide-react";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";

interface Message {
  id: string;
  question: string;
  text: string;
}

interface AiMessagesProps {
  messages: Message[];
  onEdit: (id: string, text: string) => void;
  editingId: string | null;
  editingText: string;
  onEditChange: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onNavigateToInput: () => void;
}

export default function AiMessages({
  messages,
  onEdit,
  editingId,
  editingText,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onNavigateToInput,
}: AiMessagesProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex justify-end p-2 sm:p-4 border-b border-light-border">
        <Button onClick={onNavigateToInput} variant="grayFill" className="font-normal text-xs sm:text-sm">
          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Back to Input
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-10 lg:p-20">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-description text-center">No responses yet. Start answering questions to see them here.</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div key={message.id} className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card-main rounded-soft overflow-hidden">
                  <p className="p-2 bg-accent flex items-start gap-2 text-sm sm:text-base">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-title text-accent flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    {message.question}
                  </p>

                  {editingId === message.id ? (
                    <div className="p-3 sm:p-4 space-y-2">
                      <Textarea
                        value={editingText}
                        onChange={(e) => onEditChange(e.target.value)}
                        className="resize-none min-h-20 text-sm sm:text-lg ring-2 ring-accent/50"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onCancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={onSaveEdit}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-2 sm:gap-4 p-3 sm:p-4">
                      <p className="text-sm sm:text-base whitespace-pre-wrap flex-1">{message.text}</p>
                      <Button
                        variant="grayFill"
                        onClick={() => {
                          onEdit(message.id, message.text);
                        }}
                      >
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
    </div>
  );
}
