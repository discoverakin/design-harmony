import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import HobbyCategoryCard from "./HobbyCategoryCard";
import type { HobbyData } from "@/data/hobbies";

interface HobbyCategoryGroupProps {
  title: string;
  emoji: string;
  description: string;
  hobbies: HobbyData[];
  defaultOpen?: boolean;
}

const HobbyCategoryGroup = ({
  title,
  emoji,
  description,
  hobbies,
  defaultOpen = true,
}: HobbyCategoryGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-1 py-2 group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{emoji}</span>
          <div className="text-left">
            <h3 className="text-sm font-bold text-foreground leading-tight">
              {title}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            {hobbies.length}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2 pb-1">
              {hobbies.map((hobby) => (
                <HobbyCategoryCard
                  key={hobby.slug}
                  emoji={hobby.emoji}
                  label={hobby.label}
                  bgColor={hobby.bgColor}
                  slug={hobby.slug}
                />
              ))}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1 w-full py-2 mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Show less
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HobbyCategoryGroup;
