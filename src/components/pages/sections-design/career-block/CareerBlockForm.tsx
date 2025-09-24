import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DicesIcon, Target, Text } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SocialLinksConfig {
  socialLinks: string[];
  backgroundImage?: string;
  color?: string;
  careerType?: "experience-career" | "education-career";
  background?: "with-background" | "without-background";
  title?: string;
  facilityName?: string;
  location?: string;
  date?: string;
  note?: string;
}

interface Props {
  config: SocialLinksConfig;
  onChange: (partial: Partial<SocialLinksConfig>) => void;
}

export default function CareerBlockForm({ config, onChange }: Props) {
  return (
    <div className="h-full bg-white border-r border-gray-100 w-[25rem]">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-title">Career</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm">Career</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Career Type</Label>
              <Select
                value={config.careerType || "experience-career"}
                onValueChange={(v) => onChange({ careerType: v as "experience-career" | "education-career" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education-career">Educations</SelectItem>
                  <SelectItem value="experience-career">Experiences</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center ">
              <div className="flex items-center gap-2">
                <Text className="w-5 h-5 text-accent" />
                <CardTitle className="text-sm">Career Info</CardTitle>
              </div>
              <span className="text-xs text-description">
                Talk about your study or work experience or anything else related to your career
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Career Title"
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Developer, Bachelor of IT"
                id="hero-heading"
                maxLength={40}
              />
              <FormField
                label="Facility name"
                value={config.facilityName}
                onChange={(e) => onChange({ facilityName: e.target.value })}
                placeholder="University or Company Name"
                id="hero-heading"
                maxLength={40}
              />
              <FormField
                label="Location"
                value={config.location}
                onChange={(e) => onChange({ location: e.target.value })}
                placeholder="Country - City"
                id="hero-heading"
                maxLength={30}
              />
              <FormField
                label="Date"
                value={config.date}
                onChange={(e) => onChange({ date: e.target.value })}
                placeholder="June 2023 - Present"
                id="hero-heading"
                maxLength={30}
              />

              <div>
                <Label className="text-sm font-medium text-gray-700" htmlFor="career-note">
                  Note
                </Label>
                <textarea
                  id="career-note"
                  value={config.note || ""}
                  onChange={(e) => onChange({ note: e.target.value })}
                  placeholder="Details about the role, responsibilities or notes"
                  className="w-full mt-2 rounded-md bg-white border border-card-border p-2 text-sm resize-vertical min-h-[5rem]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <DicesIcon className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm">Style</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-sm text-gray-700">Background</Label>
              <Select
                value={config.background || "with-background"}
                onValueChange={(v) => onChange({ background: v as "with-background" | "without-background" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="with-background">Yes</SelectItem>
                  <SelectItem value="without-background">No</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
