export interface Tier {
  label: string;
  price: string;
  seatLimit: string;
}

export interface WizardData {
  // Step 1
  title: string;
  description: string;
  category: string;
  coverImage: File | null;
  coverImagePreview: string | null;

  // Step 2
  scheduleType: "one_time" | "recurring";
  oneTimeDate: Date | null;
  oneTimeTime: string;
  frequency: "weekly" | "biweekly" | "monthly" | "custom";
  daysOfWeek: number[];
  timeOfDay: string;
  startDate: Date | null;
  endDate: Date | null;
  ongoing: boolean;

  // Step 3
  maxSeats: string;
  waitlistEnabled: boolean;
  waitlistMode: "auto" | "manual";
  cancellationHours: string;
  refundPolicy: "full" | "partial" | "none";

  // Step 4
  pricingType: "free" | "paid" | "tiered";
  price: string;
  tiers: Tier[];
}

export const defaultWizardData: WizardData = {
  title: "",
  description: "",
  category: "",
  coverImage: null,
  coverImagePreview: null,
  scheduleType: "one_time",
  oneTimeDate: null,
  oneTimeTime: "10:00",
  frequency: "weekly",
  daysOfWeek: [],
  timeOfDay: "10:00",
  startDate: null,
  endDate: null,
  ongoing: false,
  maxSeats: "20",
  waitlistEnabled: false,
  waitlistMode: "auto",
  cancellationHours: "24",
  refundPolicy: "full",
  pricingType: "free",
  price: "",
  tiers: [{ label: "", price: "", seatLimit: "" }],
};
