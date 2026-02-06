import AppHeader from "@/components/AppHeader";
import QuickStartSection from "@/components/QuickStartSection";
import BrowseHobbiesSection from "@/components/BrowseHobbiesSection";
import HobbyQuizCTA from "@/components/HobbyQuizCTA";
import NearYouMap from "@/components/NearYouMap";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          <QuickStartSection />
          <BrowseHobbiesSection />
          <HobbyQuizCTA />
          <NearYouMap />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
