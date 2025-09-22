import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Grid3X3, Plus } from "lucide-react";

export interface ServiceItem {
  id: string;
  imageSrc: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface BusinessServicesConfig {
  items: ServiceItem[];
  layout?: "row" | "column";
}

export default function BusinessServicesBlockForm({
  config,
  onChange,
}: {
  config: BusinessServicesConfig;
  onChange: (partial: Partial<BusinessServicesConfig>) => void;
}) {
  const addItem = () => {
    const id = Math.random().toString(36).slice(2, 9);
    const next = [
      ...((config.items || []) as ServiceItem[]),
      {
        id,
        imageSrc: "/assets/images/Placeholder.png",
        title: "Service title",
        description: "Short service description",
        ctaLabel: "Learn More",
        ctaLink: "#",
      },
    ];
    onChange({ items: next });
  };

  const removeItem = (id: string) => {
    const next = (config.items || []).filter((i) => i.id !== id);
    onChange({ items: next });
  };

  const updateItem = (id: string, patch: Partial<ServiceItem>) => {
    const next = (config.items || []).map((i) => (i.id === id ? { ...i, ...patch } : i));
    onChange({ items: next });
  };

  return (
    <div className="h-full bg-white border-r border-gray-100 w-[25rem]">
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-title">Business Services</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Items list */}
          {(config.items || []).map((item, idx) => (
            <Card key={item.id}>
              <CardHeader className="flex-row items-center gap-2">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-accent" />
                  <CardTitle className="text-sm">Service</CardTitle>
                  <span className="flex justify-center items-center text-white font-semibold w-5 h-5 rounded-full p-3 bg-accent">
                    {idx + 1}
                  </span>
                </div>
                <div className="ml-auto">
                  <Button variant="link" className="p-0 text-accent" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Image URL"
                  value={item.imageSrc}
                  onChange={(e) => updateItem(item.id, { imageSrc: e.target.value })}
                  placeholder="/assets/images/Placeholder.png or https://..."
                  id={`service-image-${item.id}`}
                />
                <FormField
                  label="Title"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                  placeholder="Service title"
                  id={`service-title-${item.id}`}
                  maxLength={60}
                />
                <FormField
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Short description"
                  id={`service-desc-${item.id}`}
                  maxLength={160}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Button Label"
                    value={item.ctaLabel}
                    onChange={(e) => updateItem(item.id, { ctaLabel: e.target.value })}
                    placeholder="Learn More"
                    id={`service-cta-label-${item.id}`}
                    maxLength={24}
                  />
                  <FormField
                    label="Button Link"
                    value={item.ctaLink}
                    onChange={(e) => updateItem(item.id, { ctaLink: e.target.value })}
                    placeholder="https://example.com"
                    id={`service-cta-link-${item.id}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full h-40 sm:h-48 border-2 border-dashed border-card-border bg-base-bg text-description rounded-base"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Plus className="w-7 h-7 text-accent" />
              <span className="text-sm font-semibold">Add Service</span>
              <span className="text-xs">Click to add a new card</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
