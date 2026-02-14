"use client";

import { CommunityItemType } from "@/api/community-api/community-items-endpoints";
import { CommunityCard, CommunityCardSkeleton } from "@/components/pages/community/shared/CommunityCard";
import { COMMUNICATION_TYPES } from "./CommunicationCreateDialog";
import { SocialIcon } from "react-social-icons";
import { ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-tools/ui/dropdown-menu";

interface CommunicationsListSectionProps {
  communications: CommunityItemType[];
  loading: boolean;
  isOwner?: boolean;
  onEdit?: (communication: CommunityItemType) => void;
  onDelete?: (commId: string) => void;
}

const getIconForType = (type?: string, url?: string) => {
  // Use react-social-icons when possible; fall back to external link icon if missing
  try {
    return <SocialIcon network={type as any} url={url || undefined} className="w-30 h-30" />;
  } catch (e) {
    return <ExternalLink className="w-6 h-6" />;
  }
};

const getLabelForType = (type?: string) => {
  return COMMUNICATION_TYPES.find((t) => t.value === type?.toLowerCase())?.label || type || "Communication";
};

// color helper removed — icons now use branded colors from react-social-icons

export const CommunicationsListSection = ({
  communications,
  loading,
  isOwner,
  onEdit,
  onDelete,
}: CommunicationsListSectionProps) => {
  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommunityCardSkeleton key={i} withFooter={false} />
        ))}
      </div>
    );
  }

  if (communications.length === 0) {
    return null;
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {communications.map((communication) => {
        const commType = communication.metadata?.communicationType;
        const commUrl = communication.metadata?.communicationUrl;

        return (
          <CommunityCard key={communication.id} className="flex flex-col h-full relative">
            {isOwner && (
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="transparent" size="icon">
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuGroup>
                      {onEdit && <DropdownMenuItem onClick={() => onEdit(communication)}>Edit</DropdownMenuItem>}
                      {onDelete && <DropdownMenuItem onClick={() => onDelete(communication.id)}>Delete</DropdownMenuItem>}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="rounded-lg flex items-center justify-center flex-shrink-0">
                  {getIconForType(commType, commUrl)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-title truncate">{communication.title}</h3>
                  <p className="text-xs text-description">{getLabelForType(commType)}</p>
                </div>
              </div>
            </div>

            {communication.content && <p className="text-sm text-description mb-3 line-clamp-2">{communication.content}</p>}

            {commUrl && (
              <div className="mt-auto pt-3 border-t border-white/10">
                <Button variant="grayFill" className="w-full gap-2 text-xs" asChild>
                  <a href={commUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                </Button>
              </div>
            )}
          </CommunityCard>
        );
      })}
    </div>
  );
};
