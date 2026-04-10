import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addWeeks, setDay, startOfDay } from "date-fns";
import WizardProgress from "@/components/dashboard/wizard/WizardProgress";
import StepTypeDetails from "@/components/dashboard/wizard/StepTypeDetails";
import StepSchedule from "@/components/dashboard/wizard/StepSchedule";
import StepCapacity from "@/components/dashboard/wizard/StepCapacity";
import StepPricing from "@/components/dashboard/wizard/StepPricing";
import StepReview from "@/components/dashboard/wizard/StepReview";
import { WizardData, defaultWizardData } from "@/components/dashboard/wizard/types";
import { ChevronLeft, ChevronRight, Save, Rocket } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardExperienceNew() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const update = (updates: Partial<WizardData>) => setData((prev) => ({ ...prev, ...updates }));

  const uploadCover = async (): Promise<string | null> => {
    if (!data.coverImage || !user) return null;
    const ext = data.coverImage.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("experience-covers").upload(path, data.coverImage);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("experience-covers").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const generateSessions = (experienceId: string) => {
    const sessions: { experience_id: string; starts_at: string; ends_at: string; capacity: number; waitlist_enabled: boolean; cancellation_hours: number; refund_policy: string }[] = [];
    const capacity = parseInt(data.maxSeats) || 20;
    const cancHours = parseInt(data.cancellationHours) || 24;
    const sessionDurationMs = 60 * 60 * 1000; // 1 hour default

    if (data.scheduleType === "one_time" && data.oneTimeDate) {
      const [h, m] = data.oneTimeTime.split(":").map(Number);
      const start = new Date(data.oneTimeDate);
      start.setHours(h, m, 0, 0);
      sessions.push({
        experience_id: experienceId,
        starts_at: start.toISOString(),
        ends_at: new Date(start.getTime() + sessionDurationMs).toISOString(),
        capacity,
        waitlist_enabled: data.waitlistEnabled,
        cancellation_hours: cancHours,
        refund_policy: data.refundPolicy,
      });
    } else if (data.scheduleType === "recurring" && data.startDate) {
      const [h, m] = data.timeOfDay.split(":").map(Number);
      const endDate = data.ongoing ? addWeeks(data.startDate, 12) : (data.endDate ?? addWeeks(data.startDate, 12));
      const incrementWeeks = data.frequency === "biweekly" ? 2 : 1;
      let current = startOfDay(data.startDate);

      while (current <= endDate && sessions.length < 200) {
        for (const dow of data.daysOfWeek.sort()) {
          let day = setDay(current, dow, { weekStartsOn: 0 });
          if (day < data.startDate) continue;
          if (day > endDate) break;
          const start = new Date(day);
          start.setHours(h, m, 0, 0);
          sessions.push({
            experience_id: experienceId,
            starts_at: start.toISOString(),
            ends_at: new Date(start.getTime() + sessionDurationMs).toISOString(),
            capacity,
            waitlist_enabled: data.waitlistEnabled,
            cancellation_hours: cancHours,
            refund_policy: data.refundPolicy,
          });
        }
        current = addWeeks(current, incrementWeeks);
      }
    }
    return sessions;
  };

  const submit = async (status: "draft" | "published") => {
    if (!user) return;
    setSubmitting(true);
    try {
      const coverUrl = await uploadCover();

      const { data: exp, error: expError } = await supabase
        .from("experiences")
        .insert({
          host_id: user.id,
          title: data.title,
          description: data.description || null,
          category: data.category || null,
          cover_image_url: coverUrl,
          pricing_type: data.pricingType,
          price: data.pricingType === "paid" ? parseFloat(data.price) || 0 : null,
          status,
          schedule_type: data.scheduleType,
          frequency: data.scheduleType === "recurring" ? data.frequency : null,
          days_of_week: data.scheduleType === "recurring" ? data.daysOfWeek : null,
          time_of_day: data.scheduleType === "one_time" ? data.oneTimeTime : data.timeOfDay,
          start_date: (data.scheduleType === "one_time" ? data.oneTimeDate : data.startDate)?.toISOString().split("T")[0] ?? null,
          end_date: data.scheduleType === "recurring" && !data.ongoing ? data.endDate?.toISOString().split("T")[0] ?? null : null,
          ongoing: data.scheduleType === "recurring" ? data.ongoing : false,
          max_seats: parseInt(data.maxSeats) || null,
          waitlist_enabled: data.waitlistEnabled,
          waitlist_mode: data.waitlistEnabled ? data.waitlistMode : null,
          cancellation_hours: parseInt(data.cancellationHours) || 24,
          refund_policy: data.refundPolicy,
        } as any)
        .select("id")
        .single();

      if (expError) throw expError;

      // Generate sessions
      const sessions = generateSessions(exp.id);
      if (sessions.length > 0) {
        const { error: sessError } = await supabase.from("experience_sessions").insert(sessions as any);
        if (sessError) throw sessError;
      }

      // Insert tiers if tiered pricing
      if (data.pricingType === "tiered" && data.tiers.length > 0) {
        const tiers = data.tiers
          .filter((t) => t.label && t.price)
          .map((t) => ({
            experience_id: exp.id,
            label: t.label,
            price: parseFloat(t.price) || 0,
            seat_limit: parseInt(t.seatLimit) || null,
          }));
        if (tiers.length > 0) {
          const { error: tierError } = await supabase.from("experience_tiers").insert(tiers as any);
          if (tierError) throw tierError;
        }
      }

      toast.success(status === "published" ? "Experience published!" : "Draft saved!");
      navigate("/dashboard/experiences");
    } catch (err: any) {
      toast.error(err.message || "Failed to save experience");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    <StepTypeDetails data={data} onChange={update} />,
    <StepSchedule data={data} onChange={update} />,
    <StepCapacity data={data} onChange={update} />,
    <StepPricing data={data} onChange={update} />,
    <StepReview data={data} />,
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Create Experience</h1>
      <WizardProgress currentStep={step} onStepClick={setStep} />

      {steps[step]}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => submit("draft")} disabled={submitting}>
              <Save className="h-4 w-4 mr-1" /> Save as Draft
            </Button>
            <Button onClick={() => submit("published")} disabled={submitting}>
              <Rocket className="h-4 w-4 mr-1" /> Publish Now
            </Button>
          </div>
        )}
      </div>
      </main>
      <BottomNav />
    </div>
  );
}
