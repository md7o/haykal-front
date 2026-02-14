import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-tools/ui/card";
import { FormField } from "@/components/ui-tools/ui/form-field";
import { Type, AlignLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui-tools/ui/select";
import { Textarea } from "@/components/ui-tools/ui/textarea";
import { blockFormStyles } from "../blockFormStyles";

export interface TextBlockConfig {
  title: string;
  description: string;
  alignment?: "left" | "center" | "right";
  style?: "with-background" | "without-background";
}

interface Props {
  config: TextBlockConfig;
  onChange: (partial: Partial<TextBlockConfig>) => void;
}

export default function TextBlockForm({ config, onChange }: Props) {
  return (
    <div className={blockFormStyles.root}>
      <div className={blockFormStyles.panel}>
        {/* Header */}
        <div className={blockFormStyles.header}>
          <h2 className={blockFormStyles.headerTitle}>Text</h2>
        </div>

        {/* Form Content */}
        <div className={blockFormStyles.content}>
          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Title"
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Enter title..."
                id="text-title"
                maxLength={60}
                helperText="Max 60 characters"
              />
              <div>
                <label htmlFor="text-description" className="text-sm font-medium text-title">
                  Description
                </label>
                <Textarea
                  id="text-description"
                  value={config.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Write a brief description..."
                  className="mt-2 w-full min-h-28 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-title focus:outline-none focus:ring-1 focus:ring-accent"
                  maxLength={240}
                />
                <p className="text-sm text-description mt-1">Max 240 characters</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Layout</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-title">Alignment</label>
                <Select
                  value={config.alignment || "center"}
                  onValueChange={(v) => onChange({ alignment: v as "left" | "center" | "right" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-title">Background</label>
                <Select
                  value={config.style || "without-background"}
                  onValueChange={(v) => onChange({ style: v as "with-background" | "without-background" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with-background">yes</SelectItem>
                    <SelectItem value="without-background">No</SelectItem>
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
