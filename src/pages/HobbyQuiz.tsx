import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { quizQuestions, calculateResults } from "@/data/quiz";
import { hobbies } from "@/data/hobbies";

const HobbyQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0…questions.length = questions, last+1 = results
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSteps = quizQuestions.length;
  const isResults = step >= totalSteps;
  const currentQ = quizQuestions[step];
  const progress = isResults ? 100 : Math.round((step / totalSteps) * 100);

  const animateTransition = useCallback(
    (dir: "left" | "right", cb: () => void) => {
      setAnimDir(dir);
      setIsAnimating(true);
      // Wait for exit animation
      setTimeout(() => {
        cb();
        setIsAnimating(false);
      }, 250);
    },
    []
  );

  const selectOption = (optionIdx: number) => {
    if (isAnimating) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
    // Auto-advance after short delay
    setTimeout(() => {
      animateTransition("right", () => setStep((s) => s + 1));
    }, 300);
  };

  const goBack = () => {
    if (step === 0 || isAnimating) return;
    animateTransition("left", () => setStep((s) => s - 1));
  };

  const restart = () => {
    animateTransition("left", () => {
      setAnswers({});
      setStep(0);
    });
  };

  const results = isResults ? calculateResults(answers) : [];
  const topResults = results.slice(0, 3);

  // Animation classes
  const enterClass = isAnimating
    ? animDir === "right"
      ? "animate-slide-out-left"
      : "animate-slide-out-right"
    : "animate-slide-in";

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <header className="flex items-center gap-3 bg-secondary px-4 py-4">
        <button
          onClick={() => (step === 0 ? navigate("/") : goBack())}
          className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? "Back" : "Previous"}
        </button>
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-xs text-muted-foreground font-medium min-w-[40px] text-right">
          {isResults ? "Done" : `${step + 1}/${totalSteps}`}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden px-5 py-6">
        <div key={step} className={enterClass}>
          {!isResults && currentQ ? (
            /* ── Question ── */
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <span className="text-5xl mb-3 block">{currentQ.emoji}</span>
                <h1 className="text-xl font-bold text-foreground leading-snug">
                  {currentQ.question}
                </h1>
              </div>

              <div className="flex flex-col gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectOption(idx)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? "border-primary bg-secondary shadow-md scale-[1.02]"
                          : "border-border bg-card hover:bg-secondary/40 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                      <span className="text-sm font-medium text-foreground">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="ml-auto text-primary text-lg">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Results ── */
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <span className="text-5xl mb-3 block">🎉</span>
                <h1 className="text-2xl font-bold text-foreground">
                  Your Perfect Hobbies
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on your answers, here's what we think you'll love
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {topResults.map((result, rank) => {
                  const hobby = hobbies.find((h) => h.slug === result.slug);
                  if (!hobby) return null;
                  const maxScore = totalSteps * 3;
                  const matchPct = Math.min(
                    100,
                    Math.round((result.score / maxScore) * 100)
                  );
                  const medals = ["🥇", "🥈", "🥉"];

                  return (
                    <Link
                      key={hobby.slug}
                      to={`/hobby/${hobby.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors animate-pop-in"
                      style={{ animationDelay: `${rank * 120}ms` }}
                    >
                      <span className="text-2xl flex-shrink-0">
                        {medals[rank]}
                      </span>
                      <div
                        className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: hobby.bgColor }}
                      >
                        <span className="text-xl">{hobby.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {hobby.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress
                            value={matchPct}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-[11px] font-semibold text-primary min-w-[36px] text-right">
                            {matchPct}%
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <Button
                  onClick={() => {
                    if (topResults[0]) {
                      navigate(`/hobby/${topResults[0].slug}`);
                    }
                  }}
                  className="w-full rounded-xl h-12 text-base font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore top match
                </Button>
                <Button
                  variant="outline"
                  onClick={restart}
                  className="w-full rounded-xl h-12 text-base font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HobbyQuiz;
