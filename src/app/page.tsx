"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CategoryTree } from "@/lib/types/category";
import { StockCharts } from "@/components/home/stock-charts";
import { ValueCardsCarousel } from "@/components/home/value-cards-carousel";

// Lazy load 3D background
const Background3D = dynamic(
  () =>
    import("@/components/3d/background-3d").then((mod) => ({
      default: mod.Background3D,
    })),
  { ssr: false }
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Home() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const mainCategories = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.order - b.order);

  const firstCategory = mainCategories[0];

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* 3D Background */}
      <Background3D />

      {/* Overlay for blending 3D */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-0" />

      {/* HERO */}
      <section className="relative py-20  z-10">
        <Container>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 mb-6 text-muted-foreground"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Market Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight"
            >
              Smarter Decisions
              <br />
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Backed by Market Intelligence
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Expert analysis across micro-economics, equities, commodities, and
              global markets — designed to help you think clearly and act
              confidently.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {firstCategory && (
                <Link
                  href={`/category/${firstCategory.slug}`}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-md font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  Explore Insights
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}

              <Link
                href="#categories"
                className="inline-flex items-center px-8 py-4 border border-border rounded-md font-medium transition hover:bg-accent"
              >
                Browse Categories
              </Link>
            </motion.div>

            {/* Trust Strip */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Data-driven insights
              </span>
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Macro & micro analysis
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Long-term focus
              </span>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* VALUE CARDS CAROUSEL */}
      <ValueCardsCarousel />

      {/* STOCK CHARTS */}
      <StockCharts />

      {/* CATEGORIES */}
      <section
        id="categories"
        className="relative py-12 md:py-16 bg-muted/30 z-10"
      >
        <Container>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Explore by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Deep dives into key investment areas and market themes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {mainCategories.slice(0, 6).map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="group block p-6 bg-background border border-border rounded-md transition-all hover:-translate-y-1 hover:shadow-xl hover:bg-accent/40"
                >
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    {category.name}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    {category.subcategories?.length
                      ? `${category.subcategories.length} subcategories`
                      : "Expert insights and analysis"}
                  </p>

                  <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    Explore
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
