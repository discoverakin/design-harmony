import { MapPin } from "lucide-react";

const markers = [
  { emoji: "🎨", left: "20%", top: "20%" },
  { emoji: "⚽", left: "65%", top: "15%" },
  { emoji: "📚", left: "40%", top: "45%" },
  { emoji: "👨‍🍳", left: "55%", top: "60%" },
  { emoji: "🎵", left: "30%", top: "35%" },
];

const NearYouMap = () => {
  return (
    <section className="px-4 pt-6 pb-4">
      <h2 className="text-lg font-bold text-foreground mb-3">Near You</h2>
      <div className="relative h-[280px] rounded-2xl border-2 border-border bg-map-bg overflow-hidden">
        {/* SVG decorative roads */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 354 276"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M0 100C100 86.6666 200 93.3333 300 120" className="stroke-map-road" strokeWidth="24" />
          <path d="M150 0V280" className="stroke-map-road" strokeWidth="20" />
          <path d="M50 200C136.667 186.667 239.333 193.333 358 220" className="stroke-map-road" strokeWidth="18" />
        </svg>

        {/* Green patches */}
        <div className="absolute w-16 h-16 rounded-full bg-map-park/60" style={{ left: "68%", top: "10%" }} />
        <div className="absolute w-20 h-12 rounded-full bg-map-park/60" style={{ left: "20%", top: "67%" }} />

        {/* Map markers */}
        {markers.map((marker, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: marker.left, top: marker.top }}
          >
            <div className="relative">
              <MapPin className="w-8 h-8 text-foreground fill-foreground" />
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[14px]">
                {marker.emoji}
              </span>
            </div>
          </div>
        ))}

        {/* Current location dot */}
        <div className="absolute" style={{ left: "48%", top: "55%" }}>
          <div className="w-4 h-4 rounded-full bg-map-location border-[3px] border-card shadow-lg" />
          <div className="absolute -inset-1 rounded-full bg-map-location/20 animate-ping" />
        </div>

      </div>
    </section>
  );
};

export default NearYouMap;
