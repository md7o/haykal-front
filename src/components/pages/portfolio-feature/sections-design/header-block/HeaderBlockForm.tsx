import { FormField } from "@/components/ui-tools/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-tools/ui/card";
import { Input } from "@/components/ui-tools/ui/input";
import { Label } from "@/components/ui-tools/ui/label";
import { Image as ImageIcon, Type } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui-tools/ui/select";
import { blockFormStyles } from "../blockFormStyles";

export interface HeaderConfig {
  siteName: string;
  logoSrc?: string;
  fixed?: boolean;
  active?: boolean;
  backgroundType?: "none" | "normal";
  displayMode?: "logo" | "title" | "both";
  pages?: Array<{ id: string; title: string; slug?: string | null }>;
}

interface Props {
  config: HeaderConfig;
  onChange: (partial: Partial<HeaderConfig>) => void;
}

export default function HeaderBlockForm({ config, onChange }: Props) {
  return (
    <div className={blockFormStyles.root}>
      <div className={blockFormStyles.panel}>
        <div className={blockFormStyles.header}>
          <h2 className={blockFormStyles.headerTitle}>Header</h2>
        </div>

        <div className={blockFormStyles.content}>
          <Card>
            <CardHeader className="flex-row items-center">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Display Mode</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={config.displayMode || "both"}
                onValueChange={(v) => onChange({ displayMode: v as "logo" | "title" | "both" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Logo & Title</SelectItem>
                  <SelectItem value="logo">Logo Only</SelectItem>
                  <SelectItem value="title">Title Only</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {(config.displayMode === "title" || config.displayMode === "both" || !config.displayMode) && (
            <Card>
              <CardHeader className="flex-row items-center">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-accent" />
                  <CardTitle className="text-sm">Brand</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Site Name"
                  value={config.siteName}
                  onChange={(e) => onChange({ siteName: e.target.value })}
                  placeholder="Enter your site name"
                  id="header-site-name"
                  maxLength={40}
                />
              </CardContent>
            </Card>
          )}

          {(config.displayMode === "logo" || config.displayMode === "both" || !config.displayMode) && (
            <Card>
              <CardHeader className="flex-row items-center ">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-accent" aria-hidden="true" focusable={false} />
                  <CardTitle className="text-sm">Logo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="header-logo-upload" className="text-sm font-medium text-description">
                    Upload Logo
                  </Label>
                  <div className="relative">
                    <Input
                      id="header-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          onChange({ logoSrc: url });
                        }
                      }}
                      className="h-full file:mr-3 file:px-4 file:rounded-md file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex-row items-center">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" aria-hidden="true" focusable={false} />
                <CardTitle className="text-sm">Background</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Select
                  value={config.backgroundType || "normal"}
                  onValueChange={(v) => onChange({ backgroundType: v as "none" | "normal" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="normal">Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
