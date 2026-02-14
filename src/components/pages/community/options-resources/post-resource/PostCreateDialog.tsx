"use client";

import { useState, useEffect } from "react";
import {
  createCommunityItem,
  updateCommunityItem,
  CommunityItemTypeEnum,
  type CommunityItemType,
} from "@/api/community-api/community-items-endpoints";
import { Button } from "@/components/ui-tools/ui/button";
import { Input } from "@/components/ui-tools/ui/input";
import { Textarea } from "@/components/ui-tools/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui-tools/ui/dialog";
import { Plus, UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";

interface PostCreateDialogProps {
  ownerMembershipId: string | null;
  communityId: string;
  isOwner: boolean;
  onPostCreated: (newPost: CommunityItemType) => void;
  editPost?: CommunityItemType | null;
  onPostUpdated?: (updatedPost: CommunityItemType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PostCreateDialog = ({
  ownerMembershipId,
  communityId,
  isOwner,
  onPostCreated,
  editPost,
  onPostUpdated,
  open: controlledOpen,
  onOpenChange,
}: PostCreateDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form with edit post data when opening
  useEffect(() => {
    if (editPost && open) {
      setTitle(editPost.title);
      setContent(editPost.content);
      setImagePreview(editPost.postImage || null);
    } else if (!editPost && open) {
      // Reset form for create mode
      setTitle("");
      setContent("");
      setUploadFile(null);
      setImagePreview(null);
    }
  }, [editPost, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!ownerMembershipId && !editPost) return;
    if (!communityId && !editPost) return;
    if (!title.trim() && !content.trim()) return;

    setLoading(true);
    try {
      // Convert image to base64 if provided
      let imageBase64: string | undefined | null = undefined;
      if (uploadFile) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadFile);
        });
      }

      if (editPost) {
        // Update mode
        const updatedPost = await updateCommunityItem(editPost.id, {
          title: title.trim(),
          content: content.trim(),
          postImage: imageBase64 !== undefined ? imageBase64 : editPost.postImage,
          metadata: editPost.metadata,
        });

        setOpen(false);
        setTitle("");
        setContent("");
        setUploadFile(null);
        setImagePreview(null);

        onPostUpdated?.(updatedPost);
      } else {
        // Create mode
        const newPost = await createCommunityItem({
          title: title.trim(),
          content: content.trim(),
          membershipId: ownerMembershipId!,
          communityId: communityId,
          type: CommunityItemTypeEnum.POST,
          metadata: imageBase64 ? { postImage: imageBase64 } : undefined,
        });

        setOpen(false);
        setTitle("");
        setContent("");
        setUploadFile(null);
        setImagePreview(null);

        onPostCreated(newPost);
      }
    } catch (err) {
      console.error("Failed to create/update post", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editPost && !isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{editPost ? "Edit Post" : "Create Post"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-40 rounded-base overflow-hidden border border-card-border/40">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setUploadFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-base text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* File Upload */}
          {!uploadFile && (
            <div className="border-2 border-dashed border-card-border/40 rounded-base p-6 text-center hover:border-accent/50 transition-colors cursor-pointer">
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <div className="p-3 bg-card-bg rounded-base">
                  <ImageIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-title">Click to upload an image</p>
                  <p className="text-xs text-description mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={loading} />
              </label>
            </div>
          )}

          {/* File Info */}
          {uploadFile && (
            <div className="flex items-center justify-between p-3 bg-card-bg rounded-base">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-sm font-medium text-title truncate">{uploadFile.name}</p>
                  <p className="text-xs text-description">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadFile(null);
                  setImagePreview(null);
                }}
                className="p-1 hover:bg-error/20 text-error rounded-base transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={(!title.trim() && !content.trim()) || loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? (editPost ? "Updating..." : "Creating...") : editPost ? "Update Post" : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
