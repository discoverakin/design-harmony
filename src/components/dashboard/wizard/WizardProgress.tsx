import { cn } from "@/lib/utils";

const STEPS = [
  "Type & Details",
  "Schedule",
  "Capacity & Policies",
  "Pricing",
  "Review & Publish",
];

interface WizardProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <button
            onClick={() => i < currentStep && onStepClick(i)}
            disabled={i > currentStep}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              i === currentStep && "text-primary",
              i < currentStep && "text-primary/70 cursor-pointer hover:text-primary",
              i > currentStep && "text-muted-foreground cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-colors",
                i === currentStep && "border-primary bg-primary text-primary-foreground",
                i < currentStep && "border-primary bg-primary/10 text-primary",
                i > currentStep && "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {i < currentStep ? "✓" : i + 1}
            </span>
            <span className="hidden lg:inline">{label}</span>
          </button>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 rounded",
                i < currentStep ? "bg-primary/50" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
