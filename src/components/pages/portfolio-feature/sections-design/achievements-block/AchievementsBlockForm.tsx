import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-tools/ui/card";
import { FormField } from "@/components/ui-tools/ui/form-field";
import { Label } from "@/components/ui-tools/ui/label";
import { Image as ImageIcon, Text, Link as LinkIcon, DicesIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui-tools/ui/select";
import { Input } from "@/components/ui-tools/ui/input";
import { blockFormStyles } from "../blockFormStyles";

export interface AchievementsConfig {
  imageSrc: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  layout?: "row" | "column";
}

export default function AchievementsBlockForm({
  config,
  onChange,
}: {
  config: AchievementsConfig;
  onChange: (partial: Partial<AchievementsConfig>) => void;
}) {
  return (
    <div className={blockFormStyles.root}>
      <div className={blockFormStyles.panel}>
        <div className={blockFormStyles.header}>
          <h2 className={blockFormStyles.headerTitle}>Achievements</h2>
        </div>

        <div className={blockFormStyles.content}>
          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" aria-hidden="true" focusable={false} />
                <CardTitle className="text-sm">Background</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="hero-bg-upload">Upload Image</Label>
                <div className="relative">
                  <Input
                    id="hero-bg-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        onChange({ imageSrc: url });
                      }
                    }}
                    className="h-full file:mr-3 bg-card-bg file:px-4 file:rounded-md file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
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
                placeholder="Your Achievement Title"
                id="achievements-title"
                maxLength={60}
              />
              <FormField
                label="Description"
                value={config.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="A short description"
                id="achievements-description"
                maxLength={160}
              />
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
                placeholder="View More"
                id="achievements-cta-label"
                maxLength={24}
              />
              <FormField
                label="Button Link"
                value={config.ctaLink}
                onChange={(e) => onChange({ ctaLink: e.target.value })}
                placeholder="https://example.com"
                id="achievements-cta-link"
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
              <Label>Layout Direction</Label>
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
