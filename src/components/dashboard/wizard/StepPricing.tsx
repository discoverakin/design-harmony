import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { WizardData, Tier } from "./types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export default function StepPricing({ data, onChange }: Props) {
  const updateTier = (index: number, updates: Partial<Tier>) => {
    const tiers = data.tiers.map((t, i) => (i === index ? { ...t, ...updates } : t));
    onChange({ tiers });
  };

  const addTier = () => {
    if (data.tiers.length < 3) {
      onChange({ tiers: [...data.tiers, { label: "", price: "", seatLimit: "" }] });
    }
  };

  const removeTier = (index: number) => {
    onChange({ tiers: data.tiers.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-3">
        <Label>Pricing Type</Label>
        <RadioGroup value={data.pricingType} onValueChange={(v) => onChange({ pricingType: v as any })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="price-free" />
            <Label htmlFor="price-free">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="price-paid" />
            <Label htmlFor="price-paid">Paid</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tiered" id="price-tiered" />
            <Label htmlFor="price-tiered">Tiered</Label>
          </div>
        </RadioGroup>
      </div>

      {data.pricingType === "paid" && (
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={data.price}
              onChange={(e) => onChange({ price: e.target.value })}
              className="pl-7"
            />
          </div>
        </div>
      )}

      {data.pricingType === "tiered" && (
        <div className="space-y-4">
          <Label>Pricing Tiers (up to 3)</Label>
          {data.tiers.map((tier, i) => (
            <div key={i} className="flex gap-3 items-end p-4 rounded-lg border border-border bg-card">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Label</Label>
                <Input value={tier.label} onChange={(e) => updateTier(i, { label: e.target.value })} placeholder="e.g. Standard" />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Price ($)</Label>
                <Input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTier(i, { price: e.target.value })} />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Seats</Label>
                <Input type="number" min="1" value={tier.seatLimit} onChange={(e) => updateTier(i, { seatLimit: e.target.value })} />
              </div>
              {data.tiers.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeTier(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          {data.tiers.length < 3 && (
            <Button variant="outline" size="sm" onClick={addTier}>
              <Plus className="h-4 w-4 mr-1" /> Add Tier
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
