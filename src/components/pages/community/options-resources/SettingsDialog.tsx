"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  communityDataType,
  getCommunityDataById,
  updateCommunityData,
  deleteCommunityData,
  COMMUNITY_TYPES,
} from "@/lib/api/community-api/communityData-endpoints";
import { Copy, QrCode, Link as LinkIcon, Save, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/shadcn_ui/dialog";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Label } from "@/components/ui/shadcn_ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/shadcn_ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn_ui/tabs";
import AlertStatus from "@/components/ui/custom_ui/AlertsStatu";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import LoadingScreen from "@/components/ui/custom_ui/LoadingScreen";
import { CommunityType } from "@/lib/types/community";

interface SettingsDialogProps {
  communityId: string;
  slug: string;
  onSettingsUpdate?: (data: communityDataType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsDialog({ communityId, slug, onSettingsUpdate, open, onOpenChange }: SettingsDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [communityData, setCommunityData] = useState<communityDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<CommunityType>("social");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  // Show full-screen loading while redirecting to new slug
  const [showRedirectLoading, setShowRedirectLoading] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  // Load community data
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getCommunityDataById(communityId);
        setCommunityData(data);
        setEditSlug(data.slug);
        setEditDescription(data.description || "");
        setEditType(data.type || "social");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load community settings";
        setErrorMessage(msg);
        setShowErrorAlert(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, communityId]);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/community/${slug}/join`;

  const slugHasChanged = editSlug !== communityData?.slug;

  const handleSaveChanges = () => {
    if (!communityData) return;

    // If slug changed, show confirmation dialog first
    if (slugHasChanged) {
      setShowConfirmDialog(true);
    } else {
      // If only description changed (or no changes), proceed directly
      performSave();
    }
    // close confirmation dialog
  };

  const performSave = async () => {
    if (!communityData) return;

    setIsSaving(true);
    // Close dialog when save begins (per UX request)
    setIsOpen(false);
    setShowErrorAlert(false);
    setShowConfirmDialog(false);

    try {
      const updated = await updateCommunityData({
        id: communityData.id,
        slug: editSlug,
        description: editDescription,
        type: editType,
      });

      setCommunityData(updated);
      setEditSlug(updated.slug);
      setEditDescription(updated.description || "");
      setEditType(updated.type || "social");

      setShowSuccessAlert(true);

      // If slug changed, show loading screen briefly then navigate to new slug
      if (slugHasChanged) {
        setShowRedirectLoading(true);
        // close dialog before navigation
        setIsOpen(false);
        setTimeout(() => {
          router.push(`/community/${updated.slug}`);
        }, 1000);
      } else {
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }

      if (onSettingsUpdate) {
        onSettingsUpdate(updated);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save changes";
      setErrorMessage(msg);
      setShowErrorAlert(true);
      setShowRedirectLoading(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeleteCommunity = async () => {
    if (!communityData) return;

    setIsSaving(true);
    setShowErrorAlert(false);

    try {
      await deleteCommunityData(communityData.id);
      setShowSuccessAlert(true);
      setShowDeleteDialog(false);

      // Redirect to dashboard after deletion
      setTimeout(() => {
        setShowRedirectLoading(true);
        setIsOpen(false);
        router.push("/community/setup");
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete community";
      setErrorMessage(msg);
      setShowErrorAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {showRedirectLoading && <LoadingScreen />}
      <AlertStatus
        variant="success"
        title="Success"
        description="Settings updated successfully!"
        isVisible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        autoHide={3000}
      />
      <AlertStatus
        variant="error"
        title="Error"
        description={errorMessage}
        isVisible={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        autoHide={3000}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {!isControlled && (
          <DialogTrigger asChild>
            <Button variant="outline" size="small">
              Settings
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto px-6 py-5">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg text-title">Community Settings</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-description">Loading settings...</p>
            </div>
          ) : (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-5 rounded-soft">
                <TabsTrigger value="general" className="text-sm h-9">
                  General
                </TabsTrigger>
                <TabsTrigger value="share" className="text-sm h-9">
                  Share
                </TabsTrigger>

                <TabsTrigger value="danger" className="text-sm h-9">
                  Deletion
                </TabsTrigger>
              </TabsList>

              {/* GENERAL TAB */}
              <TabsContent value="general" className="space-y-5 mt-0">
                <div className="space-y-2.5">
                  <Label htmlFor="slug" className="text-xs font-semibold text-title uppercase tracking-wide">
                    Community Slug
                  </Label>
                  <p className="text-xs text-description/70">This appears in your community URL</p>
                  <div className="flex gap-2.5">
                    <Input
                      id="slug"
                      value={editSlug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditSlug(e.target.value)}
                      placeholder="your-community"
                      className="h-10"
                    />
                  </div>
                  <p className="text-xs text-description/60">
                    URL: <span className="font-mono text-title">/community/{editSlug}</span>
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="description" className="text-xs font-semibold text-title uppercase tracking-wide">
                    Community Description
                  </Label>
                  <p className="text-xs text-description/70">Tell members what your community is about</p>
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                    placeholder="Describe your community..."
                    rows={3}
                    maxLength={100}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-description/60">{editDescription.length} / 100 characters</p>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="type" className="text-xs font-semibold text-title uppercase tracking-wide">
                    Community Type
                  </Label>
                  <p className="text-xs text-description/70">Choose the category that best describes your community</p>
                  <Select value={editType} onValueChange={(v) => setEditType(v as CommunityType)}>
                    <SelectTrigger className="w-full" size="default">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-5 border-t border-card-border/20 flex justify-end gap-2.5">
                  <DialogClose asChild>
                    <Button variant="grayFill" size="small">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button variant="fill" size="small" onClick={handleSaveChanges} disabled={isSaving} className="gap-2">
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>

              {/* SHARE TAB */}
              <TabsContent value="share" className="space-y-5 mt-0">
                <div className="space-y-5">
                  {/* Shareable Link */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-title flex items-center gap-2 uppercase tracking-wide">
                      <LinkIcon size={14} />
                      Shareable Link
                    </Label>
                    <p className="text-xs text-description/70">Share this link to invite members to join</p>
                    <div className="flex gap-2.5">
                      <Input value={shareUrl} readOnly className="flex-1 text-description cursor-not-allowed h-10" />
                      <Button
                        variant="grayFill"
                        size="small"
                        onClick={() => handleCopyToClipboard(shareUrl, "link")}
                        className="gap-2 h-10"
                      >
                        <Copy size={16} />
                        {copiedField === "link" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-title flex items-center gap-2 uppercase tracking-wide">
                      <QrCode size={14} />
                      QR Code
                    </Label>
                    <p className="text-xs text-description/70">Scan to join the community</p>
                    <div className="flex flex-col items-center gap-3 p-5 bg-card-bg rounded-soft ">
                      <div ref={qrRef} className="bg-white p-3 rounded-soft">
                        <QRCodeSVG value={shareUrl} size={160} level="H" marginSize={3} />
                      </div>
                      {/* <Button variant="outline" size="small" onClick={downloadQRCode} className="gap-2 w-full">
                        <Copy size={14} />
                        Download QR Code
                      </Button> */}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* DANGER TAB */}
              <TabsContent value="danger" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-error">Delete Community</h4>
                  <p className="text-xs text-description/80">
                    Permanently delete this community and all associated data. This action cannot be undone.
                  </p>
                </div>

                <Button
                  variant="fill"
                  size="small"
                  className="bg-error"
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setDeleteConfirmText("");
                  }}
                  disabled={isSaving}
                >
                  <Trash2 size={16} />
                  Delete Community
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-xl sm:max-w-xl px-6 py-5">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-bold text-title">Confirm Community Name Change</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-soft p-4 space-y-3">
              <p className="text-sm font-semibold text-title">⚠️ Important Changes:</p>
              <ul className="space-y-2 text-xs text-description leading-relaxed">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Your community name will change from <span className="font-semibold text-title">"{communityData?.slug}"</span>{" "}
                    to <span className="font-semibold text-title">"{editSlug}"</span>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    The community URL will be updated, and old links will no longer work. Members won't be able to access the
                    community from the previous URL.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>You can't change the name again for the next 30 days.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-description">Are you sure you want to proceed with this change?</p>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border/20">
            <Button variant="grayFill" size="small" onClick={() => setShowConfirmDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="fill" size="small" onClick={performSave} disabled={isSaving} className="gap-2">
              {isSaving ? "Updating..." : "Yes, Change Name"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-lg px-6 py-5">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-bold text-error">Delete Community</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-error/10 border border-error/20 rounded-soft p-4 space-y-3">
              <p className="text-sm font-semibold text-title">⚠️ This action is permanent and irreversible</p>
              <ul className="space-y-2 text-xs text-description leading-relaxed">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>All community data, posts, and member information will be permanently deleted.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>Members will lose access to all community content immediately.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>This action cannot be undone.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-description">
              Are you absolutely sure you want to delete <span className="font-semibold text-title">"{communityData?.slug}"</span>{" "}
              and all its content?
            </p>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-title">
                Type<span className="text-error">"Delete {communityData?.slug}"</span> to confirm
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Delete ${communityData?.slug}`}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border/20">
            <Button
              variant="grayFill"
              size="small"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="fill"
              size="small"
              onClick={handleDeleteCommunity}
              disabled={isSaving || deleteConfirmText !== `Delete ${communityData?.slug}`}
              className="gap-2 bg-error hover:bg-error/90"
            >
              {isSaving ? "Deleting..." : "Yes, Delete Community"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
