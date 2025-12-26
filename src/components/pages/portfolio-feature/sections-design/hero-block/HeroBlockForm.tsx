import { FormField } from "@/components/ui-tools/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-tools/ui/card";
import { Input } from "@/components/ui-tools/ui/input";
import { Label } from "@/components/ui-tools/ui/label";
import { Type, Image as ImageIcon, Layout } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui-tools/ui/select";

export interface HeroConfig {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaLink?: string;
  backgroundImage: string;
  alignment: "left" | "right";
  color?: string;
  size?: "small" | "medium" | "large";
  layoutDirection?: "dir-left" | "dir-right";
}

interface Props {
  config: HeroConfig;
  onChange: (partial: Partial<HeroConfig>) => void;
}

export default function HeroBlockForm({ config, onChange }: Props) {
  return (
    <div className="h-full bg-white w-[25rem]">
      <div className=" flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-title">Hero</h2>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Content */}
          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Heading"
                value={config.heading}
                onChange={(e) => onChange({ heading: e.target.value })}
                placeholder="Enter your main heading..."
                id="hero-heading"
                maxLength={35}
              />

              <FormField
                label="Subheading"
                value={config.subheading}
                onChange={(e) => onChange({ subheading: e.target.value })}
                placeholder="Enter your supporting text..."
                id="hero-subheading"
                maxLength={100}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Button Label"
                  value={config.ctaLabel}
                  onChange={(e) => onChange({ ctaLabel: e.target.value })}
                  placeholder="Get Started"
                  id="hero-cta"
                  maxLength={20}
                />

                <FormField
                  label="Button Link"
                  value={config.ctaLink || ""}
                  onChange={(e) => onChange({ ctaLink: e.target.value })}
                  placeholder="https://example.com"
                  id="hero-cta-link"
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card>
            <CardHeader className="flex-row items-center">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm">Layout</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Flip Layout</Label>
              <Select
                value={config.layoutDirection || "dir-right"}
                onValueChange={(v) => onChange({ layoutDirection: v as "dir-left" | "dir-right" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dir-right">Image Right | Text Left</SelectItem>
                  <SelectItem value="dir-left">Image Left | Text Right</SelectItem>
                </SelectContent>
              </Select>

              {/* Alignment */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Text Alignment</Label>
                <Select value={config.alignment} onValueChange={(v) => onChange({ alignment: v as HeroConfig["alignment"] })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Background */}
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
                        onChange({ backgroundImage: url });
                      }
                    }}
                    className="h-full file:mr-3  file:px-4 file:rounded-md file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
