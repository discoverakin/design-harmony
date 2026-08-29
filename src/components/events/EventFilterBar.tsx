import { forwardRef } from "react";
import { CalendarDays, MapPin, X } from "lucide-react";
import { format, startOfToday } from "date-fns";
import { badgeVariants } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DATE_PRESET_LABELS,
  DISTANCE_FILTER_ENABLED,
  NO_FILTERS,
  RADIUS_OPTIONS_MILES,
  countActiveFilters,
  type DatePreset,
  type EventFilters,
  type PriceFilter,
} from "@/lib/eventFilters";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/**
 * A filter chip. A real `<button>` rather than the `Badge` div used elsewhere:
 * these are toggles, so they need button semantics, keyboard activation, and a
 * forwarded ref for `PopoverTrigger asChild`.
 */
const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        badgeVariants({ variant: active ? "default" : "secondary" }),
        "flex-shrink-0 text-[11px] px-3 py-1 gap-1 cursor-pointer select-none",
        className
      )}
      {...props}
    />
  )
);
Chip.displayName = "Chip";

const DATE_PRESETS: DatePreset[] = [
  "any",
  "today",
  "tomorrow",
  "this-week",
  "next-week",
  "this-month",
];

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "any", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

interface EventFilterBarProps {
  filters: EventFilters;
  onChange: (next: EventFilters) => void;
  /** Where a distance filter measures from, for the caption under the chips. */
  originLabel?: string;
  locating?: boolean;
}

/**
 * Always-on browse filters, above the list and independent of the AI search
 * bar — testers compared this directly to Eventbrite and wanted to narrow by
 * date, cost, and distance without typing a query first.
 */
const EventFilterBar = ({
  filters,
  onChange,
  originLabel,
  locating,
}: EventFilterBarProps) => {
  const activeCount = countActiveFilters(filters);
  const selectedDay = filters.day ? new Date(filters.day + "T00:00:00") : undefined;

  const setDatePreset = (preset: DatePreset) =>
    // A preset and a specific day are the same control, so picking one clears
    // the other rather than leaving two date rules half-visible.
    onChange({ ...filters, date: preset, day: null });

  return (
    <div className="space-y-2">
      {/* Date */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DATE_PRESETS.map((preset) => (
          <Chip
            key={preset}
            active={!filters.day && filters.date === preset}
            onClick={() => setDatePreset(preset)}
          >
            {DATE_PRESET_LABELS[preset]}
          </Chip>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Chip active={!!filters.day} aria-label="Pick a date">
              <CalendarDays className="w-3 h-3" />
              {selectedDay ? format(selectedDay, "EEE, MMM d") : "Pick a date"}
            </Chip>
          </PopoverTrigger>
          {/* Aligned to the end: the trigger sits at the end of a scrolling
              row, so opening leftward keeps the calendar inside the frame. */}
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDay}
              defaultMonth={selectedDay}
              // This is the upcoming list — a past day has nothing to show.
              disabled={{ before: startOfToday() }}
              onSelect={(day) =>
                onChange({
                  ...filters,
                  day: day ? format(day, "yyyy-MM-dd") : null,
                  date: "any",
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {filters.day && (
          <Chip onClick={() => onChange({ ...filters, day: null })}>
            <X className="w-3 h-3" />
            Clear date
          </Chip>
        )}
      </div>

      {/* Price and distance */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
        {PRICE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            active={filters.price === option.value}
            onClick={() => onChange({ ...filters, price: option.value })}
          >
            {option.label}
          </Chip>
        ))}

        {/* Held back until the catalogue is geocoded — see
            DISTANCE_FILTER_ENABLED. */}
        {DISTANCE_FILTER_ENABLED && (
          <>
            <span className="h-4 w-px bg-border flex-shrink-0" aria-hidden />

            <Chip
              active={filters.radiusMiles == null}
              onClick={() => onChange({ ...filters, radiusMiles: null })}
            >
              Any distance
            </Chip>
            {RADIUS_OPTIONS_MILES.map((miles) => (
              <Chip
                key={miles}
                active={filters.radiusMiles === miles}
                onClick={() => onChange({ ...filters, radiusMiles: miles })}
              >
                <MapPin className="w-3 h-3" />
                {miles} mi
              </Chip>
            ))}
          </>
        )}
      </div>

      {/* Caption: what the radius is measured from, and a way back out */}
      {(filters.radiusMiles != null || activeCount > 0) && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filters.radiusMiles != null &&
              (locating
                ? "Finding your location…"
                : `Within ${filters.radiusMiles} mi of ${originLabel ?? "downtown Ann Arbor"}`)}
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...NO_FILTERS })}
              className="text-[11px] font-semibold text-primary hover:underline flex-shrink-0"
            >
              Clear filters ({activeCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilterBar;
