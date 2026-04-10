import {
  LayoutDashboard,
  Compass,
  CreditCard,
  BarChart3,
  Users,
  Megaphone,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Experiences", url: "/dashboard/experiences", icon: Compass },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Groups", url: "/dashboard/groups", icon: Users },
  { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone },
];

const hostTypeLabels: Record<string, string> = {
  studio_owner: "Studio Owner",
  community_group: "Community Group",
  brand_sponsor: "Brand Sponsor",
};

export function HostSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "H";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-6">
        {/* Profile section */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
                <AvatarImage src={profile?.avatarUrl || ""} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {profile?.name || "Host"}
                </p>
                <p className="text-xs text-sidebar-muted truncate">
                  Studio Owner
                </p>
              </div>
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="px-4 pb-2">
            <Separator className="bg-sidebar-border" />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              tooltip="Sign Out"
              className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
