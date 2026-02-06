const QuickStartSection = () => {
  const buttons = [
    { emoji: "📋", label: "All Categories" },
    { emoji: "🔥", label: "Trending Hobbies" },
  ];

  return (
    <section className="px-4 pt-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Quick Start</h2>
      <div className="grid grid-cols-2 gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            className="flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-border bg-card hover:bg-secondary transition-colors"
          >
            <span className="text-xl">{btn.emoji}</span>
            <span className="text-sm font-medium text-foreground">{btn.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickStartSection;
