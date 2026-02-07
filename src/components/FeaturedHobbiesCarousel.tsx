import { Link } from "react-router-dom";
import { hobbies } from "@/data/hobbies";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FEATURED_SLUGS = [
  "photography",
  "yoga",
  "cooking",
  "rock-climbing",
  "pottery",
  "dance",
];

const featured = hobbies.filter((h) => FEATURED_SLUGS.includes(h.slug));

const FeaturedHobbiesCarousel = () => {
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
        <h2 className="text-lg font-bold text-foreground">Featured for You</h2>
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
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 pl-4">
          {featured.map((hobby) => (
            <Link
              key={hobby.slug}
              to={`/hobby/${hobby.slug}`}
              className="flex-shrink-0 w-[160px] group"
            >
              <div
                className="relative h-[180px] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 transition-transform duration-200 group-hover:scale-[1.03]"
                style={{ backgroundColor: hobby.bgColor }}
              >
                <span className="text-5xl mb-3 drop-shadow-sm">
                  {hobby.emoji}
                </span>
                <span className="text-sm font-semibold text-foreground text-center leading-tight">
                  {hobby.label}
                </span>
                <span className="mt-1.5 text-[11px] text-muted-foreground text-center line-clamp-2 leading-snug px-1">
                  {hobby.description.slice(0, 60)}…
                </span>
              </div>
            </Link>
          ))}
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
