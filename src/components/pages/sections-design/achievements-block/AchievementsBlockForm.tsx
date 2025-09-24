import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Text, Link as LinkIcon, DicesIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
    <div className="h-full bg-white border-r border-gray-100 w-[25rem]">
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-title">Achievements</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" aria-hidden="true" focusable={false} />
                <CardTitle className="text-sm">Background</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="hero-bg-upload" className="text-sm font-medium text-description">
                  Upload Image
                </Label>
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
                    className="h-full file:mr-3  file:px-4 file:rounded-md file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
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
