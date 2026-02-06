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

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h3 className="text-xl font-bold text-primary-foreground">
              Find Your Perfect Hobby
            </h3>
          </div>

          <p className="text-sm text-primary-foreground/90 max-w-[260px]">
            Take our quick quiz to discover hobbies tailored to you
          </p>

          <button
            onClick={() => navigate("/quiz")}
            className="mt-2 self-start bg-card text-primary font-medium text-sm px-4 py-2 rounded-full hover:bg-card/90 transition-colors"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    </section>
  );
};

export default HobbyQuizCTA;
