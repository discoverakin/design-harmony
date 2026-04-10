import { Home, BarChart3, List, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Homepage", icon: Home, path: "/dashboard" },
  { label: "Metrics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Listings", icon: List, path: "/dashboard/experiences" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
