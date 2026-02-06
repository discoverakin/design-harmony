import akinLogo from "@/assets/logo-akin.png";

const AppHeader = () => {
  return (
    <header className="flex items-center justify-center bg-secondary py-6 px-4">
      <img src={akinLogo} alt="Akin" className="h-12 w-auto" />
    </header>
  );
};

export default AppHeader;
