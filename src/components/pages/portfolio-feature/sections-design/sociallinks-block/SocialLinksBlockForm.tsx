import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn_ui/card";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Label } from "@/components/ui/shadcn_ui/label";
import { Plus, Trash2, DicesIcon, Link } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn_ui/select";
import { blockFormStyles } from "../blockFormStyles";

export interface SocialLinksConfig {
  socialLinks: string[];
  ctaLink?: string;
  blockstyle?: "grid-style" | "card-style" | "icon-style" | "transparent-style";
}

interface Props {
  config: SocialLinksConfig;
  onChange: (partial: Partial<SocialLinksConfig>) => void;
}

export default function SocialLinksForm({ config, onChange }: Props) {
  const addNewLink = () => {
    const currentLinks = config.socialLinks || [];
    onChange({ socialLinks: [...currentLinks, ""] });
  };

  const removeLink = (index: number) => {
    const currentLinks = config.socialLinks || [];
    const newLinks = currentLinks.filter((_, i) => i !== index);
    onChange({ socialLinks: newLinks });
  };

  const updateLink = (index: number, value: string) => {
    const currentLinks = config.socialLinks || [];
    const newLinks = [...currentLinks];
    newLinks[index] = value;
    onChange({ socialLinks: newLinks });
  };

  const links = config.socialLinks || ["", "", ""];

  return (
    <div className={blockFormStyles.root}>
      <div className={blockFormStyles.panel}>
        {/* Header */}
        <div className={blockFormStyles.header}>
          <h2 className={blockFormStyles.headerTitle}>Social Links</h2>
        </div>

        {/* Form Content */}
        <div className={blockFormStyles.content}>
          {/* Content: three link fields without visible labels */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Links</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="sr-only" htmlFor={`social-link-${index}`}>
                      Social Link {index + 1}
                    </Label>
                    <Input
                      id={`social-link-${index}`}
                      placeholder="Add Your Social Link"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {links.length > 1 && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => removeLink(index)}
                      className="flex-shrink-0 w-8 h-8 p-0 hover:bg-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addNewLink} className="w-full flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Social Link
              </Button>
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
              <Label>Block Style</Label>
              <Select
                value={config.blockstyle || "grid-style"}
                onValueChange={(v) => onChange({ blockstyle: v as "grid-style" | "card-style" | "icon-style" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid-style">Grid Style</SelectItem>
                  <SelectItem value="card-style">Card Style</SelectItem>
                  <SelectItem value="icon-style">Icon Style</SelectItem>
                  <SelectItem value="transparent-style">Transparent Style</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
