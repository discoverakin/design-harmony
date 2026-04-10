import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WizardData } from "./types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export default function StepCapacity({ data, onChange }: Props) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="maxSeats">Max Seats Per Session</Label>
        <Input
          id="maxSeats"
          type="number"
          min="1"
          value={data.maxSeats}
          onChange={(e) => onChange({ maxSeats: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={data.waitlistEnabled} onCheckedChange={(v) => onChange({ waitlistEnabled: v })} />
        <Label>Enable Waitlist</Label>
      </div>

      {data.waitlistEnabled && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
          <Label>Waitlist Mode</Label>
          <RadioGroup value={data.waitlistMode} onValueChange={(v) => onChange({ waitlistMode: v as any })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="wl-auto" />
              <Label htmlFor="wl-auto">Auto-promote first on waitlist</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="wl-manual" />
              <Label htmlFor="wl-manual">Manual approval</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cancellationHours">Cancellation Window (hours before session)</Label>
        <Input
          id="cancellationHours"
          type="number"
          min="0"
          value={data.cancellationHours}
          onChange={(e) => onChange({ cancellationHours: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Refund Policy</Label>
        <Select value={data.refundPolicy} onValueChange={(v) => onChange({ refundPolicy: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Refund</SelectItem>
            <SelectItem value="partial">Partial Refund (50%)</SelectItem>
            <SelectItem value="none">No Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
