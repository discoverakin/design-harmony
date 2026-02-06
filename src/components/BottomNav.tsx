import { Compass, Home, Users, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Compass, label: "Discover" },
  { icon: Home, label: "Homepage" },
  { icon: Users, label: "Community" },
  { icon: User, label: "Profile" },
];

const BottomNav = () => {
  const [active, setActive] = useState(0);

  return (
    <nav className="sticky bottom-0 z-50 bg-card border-t-2 border-border">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item, i) => {
          const isActive = active === i;
          return (
            <button
              key={item.label}
              onClick={() => setActive(i)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[72px] ${
                isActive ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <item.icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
