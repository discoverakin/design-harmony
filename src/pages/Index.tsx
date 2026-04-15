import AppHeader from "@/components/AppHeader";
import FeaturedHobbiesCarousel from "@/components/FeaturedHobbiesCarousel";
import BrowseHobbiesSection from "@/components/BrowseHobbiesSection";
import HobbyQuizCTA from "@/components/HobbyQuizCTA";
import NearYouMap from "@/components/NearYouMap";
import BottomNav from "@/components/BottomNav";
import FeedbackButton from "@/components/FeedbackButton";
import { useProfile } from "@/hooks/use-profile";

const Index = () => {
  const { profile } = useProfile();
  const quizSlugs = profile.quizResults?.recommendations?.map((r) => r.slug);

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          <FeaturedHobbiesCarousel quizSlugs={quizSlugs} />
          <BrowseHobbiesSection />
          <HobbyQuizCTA />
          <NearYouMap />
        </div>
      </main>
      <FeedbackButton />
      <BottomNav />
    </div>
  );
};

export default Index;
