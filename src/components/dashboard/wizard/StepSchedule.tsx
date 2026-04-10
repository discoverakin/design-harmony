import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { WizardData } from "./types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

function DatePicker({ date, onSelect, label }: { date: Date | null; onSelect: (d: Date | undefined) => void; label: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date ?? undefined} onSelect={onSelect} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}

export default function StepSchedule({ data, onChange }: Props) {
  const toggleDay = (day: number) => {
    const days = data.daysOfWeek.includes(day)
      ? data.daysOfWeek.filter((d) => d !== day)
      : [...data.daysOfWeek, day];
    onChange({ daysOfWeek: days });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-3">
        <Label>Schedule Type</Label>
        <RadioGroup value={data.scheduleType} onValueChange={(v) => onChange({ scheduleType: v as any })}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one_time" id="one_time" />
            <Label htmlFor="one_time">One-time event</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring">Recurring</Label>
          </div>
        </RadioGroup>
      </div>

      {data.scheduleType === "one_time" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker date={data.oneTimeDate} onSelect={(d) => onChange({ oneTimeDate: d ?? null })} label="Pick a date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oneTimeTime">Time</Label>
            <Input id="oneTimeTime" type="time" value={data.oneTimeTime} onChange={(e) => onChange({ oneTimeTime: e.target.value })} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={data.frequency} onValueChange={(v) => onChange({ frequency: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.frequency === "weekly" || data.frequency === "biweekly") && (
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day, i) => (
                  <label key={i} className="flex items-center gap-1.5">
                    <Checkbox checked={data.daysOfWeek.includes(i)} onCheckedChange={() => toggleDay(i)} />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timeOfDay">Time of Day</Label>
            <Input id="timeOfDay" type="time" value={data.timeOfDay} onChange={(e) => onChange({ timeOfDay: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker date={data.startDate} onSelect={(d) => onChange({ startDate: d ?? null })} label="Pick start date" />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={data.ongoing} onCheckedChange={(v) => onChange({ ongoing: v })} />
            <Label>Ongoing (no end date)</Label>
          </div>

          {!data.ongoing && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker date={data.endDate} onSelect={(d) => onChange({ endDate: d ?? null })} label="Pick end date" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
