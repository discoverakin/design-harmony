import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface ProfileAvatarProps {
  user: {
    name: string;
    handle: string;
    avatarFallback: string;
    avatarUrl?: string | null;
    memberSince: string;
  };
  onEditClick?: () => void;
}

const ProfileAvatar = ({ user, onEditClick }: ProfileAvatarProps) => (
  <div className="flex flex-col items-center pt-8 pb-5 gap-3">
    <div className="relative">
      <Avatar className="w-24 h-24 border-4 border-primary/20">
        <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
        <AvatarFallback className="text-2xl font-bold bg-secondary text-primary">
          {user.avatarFallback}
        </AvatarFallback>
      </Avatar>
      <button
        onClick={onEditClick}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-transform"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
    <div className="text-center">
      <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
      <p className="text-sm text-muted-foreground">{user.handle}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Member since {user.memberSince}
      </p>
    </div>
  </div>
);

export default ProfileAvatar;
