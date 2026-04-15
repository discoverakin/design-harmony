import { useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import akinLogo from "@/assets/logo-akin.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AkinHeader() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <header className="w-full bg-secondary py-5 px-4 flex items-center justify-between rounded-b-3xl">
      {/* Spacer for centering logo */}
      <div className="w-9" />

      <img src={akinLogo} alt="Akin" className="h-12 w-auto" />

      {/* Hamburger menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-xl hover:bg-accent transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              navigate("/", { replace: true });
            }}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
