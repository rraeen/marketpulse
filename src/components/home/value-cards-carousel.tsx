"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap 
} from "lucide-react";
import { Container } from "@/components/ui/container";

interface ValueCard {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const valueCards: ValueCard[] = [
  {
    id: 1,
    title: "Clarity",
    description: "Clear thinking without market noise or hype.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Discipline",
    description: "Structured analysis for consistent decisions.",
    icon: Target,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Confidence",
    description: "Insights backed by data, not emotions.",
    icon: ShieldCheck,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    title: "Growth",
    description: "Long-term strategies for sustainable returns.",
    icon: TrendingUp,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    title: "Speed",
    description: "Real-time insights when you need them most.",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
];

export function ValueCardsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % valueCards.length);
    }, 4000); // Auto-rotate every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Get 3 visible cards with wrap-around logic
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % valueCards.length;
      cards.push(valueCards[index]);
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <section className="relative py-12 z-10">
      <Container>
        <div className="relative">
          {/* Cards Container */}
          <div className="relative overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={`${card.id}-${currentIndex}`}
                      initial={{ opacity: 0, x: 300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -300 }}
                      transition={{ 
                        duration: 0.7,
                        delay: index * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={[
                        // On mobile we show only one card to avoid z-index/overlap glitches
                        index > 0 ? "hidden md:block" : "",
                        "relative bg-background border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all",
                      ].join(" ")}
                      onMouseEnter={() => setIsAutoPlaying(false)}
                      onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="relative z-20 flex justify-center items-center gap-2 mt-6">
            {valueCards.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index
                    ? "w-8 h-2 bg-foreground"
                    : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
