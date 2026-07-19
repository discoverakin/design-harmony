import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import FeaturedHobbiesCarousel from "@/components/FeaturedHobbiesCarousel";
import BrowseHobbiesSection from "@/components/BrowseHobbiesSection";
import HobbyQuizCTA from "@/components/HobbyQuizCTA";
import NearYouMap from "@/components/NearYouMap";
import BottomNav from "@/components/BottomNav";
import FeedbackButton from "@/components/FeedbackButton";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const quizSlugs = profile.quizResults?.recommendations?.map((r) => r.slug);

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {!user && (
        <div className="bg-[#F9E9E4] dark:bg-secondary text-center py-2 px-4 text-xs text-[#8B6B61] dark:text-muted-foreground">
          Business owner?{" "}
          <Link
            to="/login?type=owner"
            className="text-[#E8604A] font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      )}
      <AppHeader />
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          {user && <FeaturedHobbiesCarousel quizSlugs={quizSlugs} />}
          <BrowseHobbiesSection />
          {user && <HobbyQuizCTA />}
          <NearYouMap />
        </div>
      </main>
      <FeedbackButton />
      <BottomNav />
    </div>
  );
};

export default Index;
