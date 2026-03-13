import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock } from "lucide-react";
import { getHobbyBySlug } from "@/data/hobbies";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ShareButton from "@/components/social/ShareButton";
import AvatarStack from "@/components/social/AvatarStack";
import TrendingBadge from "@/components/social/TrendingBadge";
import TestimonialCarousel from "@/components/social/TestimonialCarousel";
import LiveActivityBanner from "@/components/social/LiveActivityBanner";

const HobbyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const hobby = getHobbyBySlug(slug || "");

  if (!hobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background max-w-lg mx-auto">
        <p className="text-lg text-muted-foreground">Hobby not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Hero */}
      <div
        className="relative px-4 pt-6 pb-10"
        style={{ backgroundColor: hobby.bgColor }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4">
          <span className="text-6xl">{hobby.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                {hobby.label}
              </h1>
              <TrendingBadge variant="popular" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <AvatarStack count={42} max={4} size="sm" label="42 people tried this" />
            </div>
          </div>
          <ShareButton
            title={hobby.label}
            text={`Check out ${hobby.label} on Akin!`}
            url={window.location.href}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-4 shadow-lg px-5 pt-6">
          {/* Description */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {hobby.description}
            </p>
          </section>

          {/* Benefits */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Why try it?</h2>
            <ul className="space-y-2">
              {hobby.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Nearby classes */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">
              <MapPin className="w-4 h-4 inline-block mr-1 text-primary -mt-0.5" />
              Nearby classes
            </h2>
            <div className="space-y-3">
              {hobby.nearbyClasses.map((cls) => (
                <button
                  key={cls.name}
                  className="flex items-center justify-between w-full p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cls.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cls.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-0.5 text-xs font-medium text-foreground">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      {cls.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">{cls.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Live activity */}
          <section className="mb-6">
            <LiveActivityBanner />
          </section>

          {/* Reviews */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">What people say</h2>
            <TestimonialCarousel compact />
          </section>

          {/* CTA */}
          <Button className="w-full rounded-xl h-12 text-base font-semibold mb-4">
            Get started
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HobbyDetail;
