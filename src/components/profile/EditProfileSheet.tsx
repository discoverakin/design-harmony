import { useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import type { ProfileData } from "@/hooks/use-profile";

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData;
  onSave: (patch: Partial<ProfileData>) => void;
}

const EditProfileSheet = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditProfileSheetProps) => {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatarUrl
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset form when opened
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setName(profile.name);
      setHandle(profile.handle);
      setAvatarPreview(profile.avatarUrl);
    }
    onOpenChange(v);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;
    onSave({ name: name.trim(), handle: cleanHandle, avatarUrl: avatarPreview });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-w-lg mx-auto">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Avatar picker */}
          <div className="relative cursor-pointer" onClick={() => fileRef.current?.click()}>
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={avatarPreview || ""} alt={name} />
              <AvatarFallback className="text-2xl font-bold bg-secondary text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Fields */}
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-handle">Handle</Label>
              <Input
                id="edit-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle"
              />
            </div>
          </div>

          <Button className="w-full mt-2" onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditProfileSheet;
