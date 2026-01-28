"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageSquare, Edit } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui-tools/ui/sidebar";
import { Button } from "@/components/ui-tools/ui/button";
import { getAllByUserId } from "@/api/ai-api/idea-endpoints";
import { useAuthStore } from "@/store/authStore";

export default function AiSidebar() {
  const user = useAuthStore((state) => state.user);
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const [recentChats, setRecentChats] = useState<Array<{ id: string; name: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIdeas = async () => {
      // Wait for auth to finish loading
      if (authIsLoading) {
        return;
      }

      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        const ideas = await getAllByUserId(user.userId);
        const chats = ideas.map((idea) => ({
          id: idea.id,
          name: idea.projectName,
          timestamp: new Date(idea.createdAt).toLocaleDateString(),
        }));
        setRecentChats(chats);
      } catch (error) {
        console.error("Failed to load ideas:", error);
        setRecentChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadIdeas();
  }, [user?.userId, authIsLoading]);

  const buttonClass =
    "rounded-base hover:bg-accent/10 transition-all text-description  group/icon flex items-center gap-3 px-3 py-4 w-full text-left";

  return (
    <Sidebar collapsible="offcanvas">
      {/* Header with Trigger and Create Button */}
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 p-4">
        <h1 className="text-lg font-bold text-title flex-1">AI Studio</h1>
        <SidebarTrigger className="h-6 w-6" />
      </SidebarHeader>

      <SidebarContent className="flex flex-col items-start">
        <Button variant="outline" onClick={() => router.push("/ai-question")}>
          <Edit size={30} />
          <span>New Chat</span>
        </Button>
        {/* Recent Chats Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-description text-xs">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="p-4 text-sm text-description">Loading...</div>
              ) : recentChats.length === 0 ? (
                <div className="p-4 text-sm text-description">No recent chats</div>
              ) : (
                recentChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild className={buttonClass}>
                      <button
                        type="button"
                        onClick={() => router.push(`/ai-response/${chat.id}`)}
                        className="flex items-center gap-3 px-3 py-4 w-full text-left cursor-pointer hover:bg-accent/10 rounded-base transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 text-title" />
                        <span className="text-sm text-title truncate">{chat.name}</span>
                        <span className="text-xs text-description">{chat.timestamp}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
