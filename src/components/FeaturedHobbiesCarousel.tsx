import { Link } from "react-router-dom";
import { hobbies } from "@/data/hobbies";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const HOBBY_PHOTOS: Record<string, string> = {
  'cooking': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'arts-crafts': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80',
  'pottery': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80',
  'dance': 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&q=80',
  'music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80',
};

const DEFAULT_SLUGS = [
  "cooking",
  "arts-crafts",
  "pottery",
  "knitting",
  "coding",
  "dance",
];

interface FeaturedHobbiesCarouselProps {
  quizSlugs?: string[] | null;
}

const FeaturedHobbiesCarousel = ({ quizSlugs }: FeaturedHobbiesCarouselProps) => {
  const isPersonalized = quizSlugs && quizSlugs.length > 0;
  const slugs = isPersonalized ? quizSlugs : DEFAULT_SLUGS;

  const featured = useMemo(
    () => slugs.map((s) => hobbies.find((h) => h.slug === s)).filter(Boolean),
    [slugs]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="pt-6 pb-2">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold text-foreground">Recommended hobbies</h2>
        {isPersonalized ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
            <Sparkles className="w-3 h-3" />
            Based on your quiz
          </span>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 pl-4">
          {featured.map((hobby) => {
            const photo = HOBBY_PHOTOS[hobby!.slug];
            return (
              <Link
                key={hobby!.slug}
                to={`/hobby/${hobby!.slug}`}
                className="flex-shrink-0 w-[160px] group"
              >
                <div className="rounded-2xl overflow-hidden border border-border/40 transition-transform duration-200 group-hover:scale-[1.03]">
                  {/* Photo or emoji fallback */}
                  {photo ? (
                    <div
                      className="h-36 bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo})` }}
                    />
                  ) : (
                    <div
                      className="h-36 flex items-center justify-center"
                      style={{ backgroundColor: hobby!.bgColor }}
                    >
                      <span className="text-5xl drop-shadow-sm">{hobby!.emoji}</span>
                    </div>
                  )}
                  {/* Text below photo */}
                  <div className="p-3" style={{ backgroundColor: hobby!.bgColor }}>
                    <span className="text-sm font-semibold text-foreground text-center block leading-tight">
                      {hobby!.label}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground text-center block line-clamp-2 leading-snug">
                      {hobby!.description.slice(0, 60)}…
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {featured.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              idx === selectedIndex
                ? "bg-primary w-4"
                : "bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedHobbiesCarousel;
