import { Compass, Home, Users, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Compass, label: "Discover", path: "/" },
  { icon: Home, label: "Homepage", path: "/home" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActive = () => {
    const path = location.pathname;
    if (path === "/") return "/";
    const match = navItems.find((item) => item.path !== "/" && path.startsWith(item.path));
    return match?.path ?? "/";
  };

  const activePath = getActive();

  return (
    <nav className="sticky bottom-0 z-50 bg-card border-t-2 border-border">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
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
