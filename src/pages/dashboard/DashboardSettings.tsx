import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Camera, Save, Shield, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

const hostTypeLabels: Record<string, string> = {
  studio_owner: "Studio Owner",
  community_group: "Community Group",
  brand_sponsor: "Brand Sponsor",
};

export default function DashboardSettings() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [fullName, setFullName] = useState(profile?.name || "");
  const [hostType, setHostType] = useState<string>("studio_owner");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [saving, setSaving] = useState(false);

  const initials = fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "H";

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        host_type: hostType as "studio_owner" | "community_group" | "brand_sponsor",
        avatar_url: avatarUrl || null,
      })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated!");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("experience-covers")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("experience-covers")
      .getPublicUrl(filePath);

    setAvatarUrl(data.publicUrl);
    toast.success("Avatar uploaded!");
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile & account</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-3 w-3" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{fullName || "Your Name"}</p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC", color: "#16A34A" }}
                >
                  ✅ Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.email || "demo@discoverakin.com"}</p>
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Host Type */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={hostType} onValueChange={setHostType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(hostTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user?.email || "demo@discoverakin.com"}
              disabled
              className="bg-muted"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Stripe / Payments Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Stripe Connect</p>
              <p className="text-xs text-muted-foreground">Receive payouts for your experiences</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">
              Not Connected
            </span>
          </div>
        </CardContent>
      </Card>
      </main>
      <BottomNav />
    </div>
  );
}
