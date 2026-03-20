import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import AnimatedRoutes from "@/components/AnimatedRoutes";

const queryClient = new QueryClient();

/** Ensures a profiles row exists for the logged-in user on every page */
const ProfileEnsurer = ({ children }: { children: React.ReactNode }) => {
  useProfile();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ProfileEnsurer>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ProfileEnsurer>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
