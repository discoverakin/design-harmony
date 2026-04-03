import { useNavigate } from "react-router-dom";

const HobbyQuizCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-primary to-[hsl(20_100%_68%)] p-6">
        {/* Decorative sparkle */}
        <span className="absolute -top-5 right-2 text-[120px] opacity-20 leading-none select-none pointer-events-none">
          ✨
        </span>

        {/* AI badge */}
        <span className="absolute top-4 right-4 text-[10px] font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
          ✦ AI-powered
        </span>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <h3 className="text-xl font-bold text-primary-foreground">
              What's Your Creative Style?
            </h3>
          </div>

          <p className="text-sm text-primary-foreground/90 max-w-[280px]">
            Answer 5 questions and our AI will match you with the perfect classes in Ann Arbor
          </p>

          <button
            onClick={() => navigate("/quiz")}
            className="mt-2 self-start bg-card text-primary font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-card/90 transition-colors"
          >
            Find My Hobbies →
          </button>

          <div className="flex gap-2 mt-1 text-lg opacity-40">
            <span>🏺</span>
            <span>🎵</span>
            <span>📷</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HobbyQuizCTA;
