import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn_ui/card";
import { FormField } from "@/components/ui/shadcn_ui/form-field";
import { Label } from "@/components/ui/shadcn_ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn_ui/select";
import { Image as ImageIcon, Text, Link as LinkIcon, DicesIcon, Clock } from "lucide-react";
import { blockFormStyles } from "../blockFormStyles";

export interface EventsConfig {
  imageSrc: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  layout?: "row" | "column";
  eventDate?: string; // yyyy-MM-ddTHH:mm
  countdownStyle?: "background" | "text"; // background cards or inline text
}

export default function EventsBlockForm({
  config,
  onChange,
}: {
  config: EventsConfig;
  onChange: (partial: Partial<EventsConfig>) => void;
}) {
  return (
    <div className={blockFormStyles.root}>
      <div className={blockFormStyles.panel}>
        <div className={blockFormStyles.header}>
          <h2 className={blockFormStyles.headerTitle}>Event</h2>
        </div>

        <div className={blockFormStyles.content}>
          {/* Media */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Image</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                label="Image URL"
                value={config.imageSrc}
                onChange={(e) => onChange({ imageSrc: e.target.value })}
                placeholder="/assets/images/Placeholder.png or https://..."
                id="events-image"
              />
            </CardContent>
          </Card>

          {/* Text */}
          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <Text className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Title"
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Your Event Title"
                id="events-title"
                maxLength={60}
              />
              <FormField
                label="Description"
                value={config.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="A short description"
                id="events-description"
                maxLength={160}
              />
            </CardContent>
          </Card>

          {/* Timer */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Countdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label className="text-sm font-medium text-gray-700" htmlFor="events-date">
                Event Date & Time
              </Label>
              <FormField
                id="events-date"
                type="datetime-local"
                value={config.eventDate || ""}
                onChange={(e) => onChange({ eventDate: e.target.value })}
                placeholder="YYYY-MM-DDTHH:mm"
                helperText="Set the target date/time for the countdown"
              />

              <Label className="text-sm font-medium text-gray-700">Countdown Style</Label>
              <Select
                value={config.countdownStyle || "background"}
                onValueChange={(v) => onChange({ countdownStyle: v as "background" | "text" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="background">Background cards (with boxes)</SelectItem>
                  <SelectItem value="text">Inline text (DD:HH:MM:SS)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Link Button</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <FormField
                label="Button Label"
                value={config.ctaLabel}
                onChange={(e) => onChange({ ctaLabel: e.target.value })}
                placeholder="Learn More"
                id="events-cta-label"
                maxLength={24}
              />
              <FormField
                label="Button Link"
                value={config.ctaLink}
                onChange={(e) => onChange({ ctaLink: e.target.value })}
                placeholder="https://example.com"
                id="events-cta-link"
              />
            </CardContent>
          </Card>

          {/* Style */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <DicesIcon className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm">Style</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Layout Direction</Label>
              <Select value={config.layout || "row"} onValueChange={(v) => onChange({ layout: v as "row" | "column" })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">Row (image beside text)</SelectItem>
                  <SelectItem value="column">Column (image above text)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
