import { useTheme } from "@/hooks/use-theme";
import akinLogo from "@/assets/logo-akin.png";
import akinLogoDark from "@/assets/logo-akin-dark.png";

const AppHeader = () => {
  const { theme } = useTheme();
  const logo = theme === "dark" ? akinLogoDark : akinLogo;

  return (
    <header className="flex items-center justify-center bg-secondary py-6 px-4">
      <img src={logo} alt="Akin" className="h-12 w-auto" />
    </header>
  );
};

export default AppHeader;
