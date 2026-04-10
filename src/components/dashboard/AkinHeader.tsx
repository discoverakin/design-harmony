import akinLogo from "@/assets/logo-akin.png";

export function AkinHeader() {
  return (
    <header className="w-full bg-secondary py-5 px-4 flex items-center justify-center rounded-b-3xl">
      <img src={akinLogo} alt="Akin" className="h-12 w-auto" />
    </header>
  );
}
