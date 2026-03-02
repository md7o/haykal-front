"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Edit, MoreVertical, Pen, Trash } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/shadcn_ui/sidebar";
import { Button } from "@/components/ui/shadcn_ui/button";
import { getAllByUserId, updateAiIdea, removeAiIdea } from "@/lib/api/ai-api/idea-endpoints";
import { useAuthStore } from "@/lib/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn_ui/dropdown-menu";
import { RenameDialog, DeleteDialog } from "./dialog/SidebarDialog";

export default function AiSidebar() {
  const user = useAuthStore((state) => state.user);
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const [recentChats, setRecentChats] = useState<Array<{ id: string; name: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingChat, setRenamingChat] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingChat, setDeletingChat] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadIdeas = async () => {
      if (authIsLoading) return;
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

  const openRenameDialog = (chat: { id: string; name: string }) => {
    setRenamingChat(chat);
    setRenameValue(chat.name);
    setRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!renamingChat || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await updateAiIdea(renamingChat.id, { projectName: renameValue.trim() });
      setRecentChats((prev) => prev.map((chat) => (chat.id === renamingChat.id ? { ...chat, name: renameValue.trim() } : chat)));
      setRenameDialogOpen(false);
    } catch (error) {
      console.error("Failed to rename idea:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const openDeleteDialog = (chat: { id: string; name: string }) => {
    setDeletingChat(chat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingChat) return;
    setIsDeleting(true);
    try {
      await removeAiIdea(deletingChat.id);
      router.push("/ai-question");
      setRecentChats((prev) => prev.filter((chat) => chat.id !== deletingChat.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete idea:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sidebar>
        {/* Header with Trigger and Create Button */}
        <SidebarHeader className="flex flex-row items-center justify-between gap-2 p-4">
          <h1 className="text-lg font-bold text-title flex-1">AI Studio</h1>
          <SidebarTrigger className="h-6 w-6" />
        </SidebarHeader>

        <SidebarContent>
          <Button variant="grayFill" className="mx-3" onClick={() => router.push("/ai-question")}>
            <Edit size={30} />
            <span>New Chat</span>
          </Button>
          {/* Recent Chats Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-description text-xs">Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <div className="p-4 text-sm text-description">Loading...</div>
                ) : recentChats.length === 0 ? (
                  <div className="p-4 text-sm text-description">No recent chats</div>
                ) : (
                  recentChats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div
                        className={`
                          flex items-center justify-between  border border-transparent hover:border-border cursor-pointer
                          rounded-soft hover:bg-accent/10 transition-all text-description group/icon  gap-3 px-3 py-1 w-full text-left
                          `}
                        onClick={() => router.push(`/ai-response/${chat.id}`)}
                      >
                        <span className="text-sm text-title truncate flex-1">{chat.name}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant={"transparent"} size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="space-y-1 py-1">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameDialog(chat);
                              }}
                            >
                              <Pen />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(chat);
                              }}
                              className="text-error focus:text-error"
                            >
                              <Trash />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        value={renameValue}
        onValueChange={setRenameValue}
        onConfirm={handleRename}
        isLoading={isRenaming}
      />

      {/* Delete Confirm Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        chatName={deletingChat?.name}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
