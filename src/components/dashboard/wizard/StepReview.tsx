import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { WizardData } from "./types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function scheduleSummary(data: WizardData): string {
  if (data.scheduleType === "one_time") {
    const date = data.oneTimeDate ? format(data.oneTimeDate, "PPP") : "TBD";
    return `One-time — ${date} at ${data.oneTimeTime}`;
  }
  const days = data.daysOfWeek.map((d) => DAYS[d]).join(", ");
  const freq = data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1);
  const end = data.ongoing ? "Ongoing" : data.endDate ? `until ${format(data.endDate, "PPP")}` : "TBD";
  return `${freq} — ${days || "TBD"} at ${data.timeOfDay}, ${end}`;
}

function priceSummary(data: WizardData): string {
  if (data.pricingType === "free") return "Free";
  if (data.pricingType === "paid") return `$${data.price || "0"}`;
  return data.tiers.map((t) => `${t.label || "Tier"}: $${t.price || "0"}`).join(" · ");
}

interface Props {
  data: WizardData;
}

export default function StepReview({ data }: Props) {
  return (
    <Card className="max-w-2xl">
      {data.coverImagePreview && (
        <img src={data.coverImagePreview} alt="Cover" className="w-full h-48 object-cover rounded-t-lg" />
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{data.title || "Untitled Experience"}</CardTitle>
          {data.category && <Badge variant="secondary">{data.category}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.description && <p className="text-sm text-muted-foreground">{data.description}</p>}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-foreground">Schedule</span>
            <p className="text-muted-foreground">{scheduleSummary(data)}</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Pricing</span>
            <p className="text-muted-foreground">{priceSummary(data)}</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Capacity</span>
            <p className="text-muted-foreground">{data.maxSeats} seats{data.waitlistEnabled ? " + waitlist" : ""}</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Cancellation</span>
            <p className="text-muted-foreground">{data.cancellationHours}h window · {data.refundPolicy === "full" ? "Full refund" : data.refundPolicy === "partial" ? "50% refund" : "No refund"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
