"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CATEGORIES } from "@/lib/constants/categories";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        <Container>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 mb-6"
            >
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Market Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight"
            >
              Professional Market
              <br />
              <span className="text-muted-foreground">Insights & Guidance</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Stay informed with expert analysis across micro-economics, stocks,
              commodities, and investment markets. Make confident decisions with
              trusted insights.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/category/micro-economics"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-md font-medium transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Insights
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#categories"
                className="inline-flex items-center px-8 py-4 border border-border rounded-md font-medium transition-all hover:bg-accent hover:border-foreground/20"
              >
                Browse Categories
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="py-24 md:py-32 bg-muted/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Explore by Category
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Dive deep into specialized market analysis across key investment
                areas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  <Link
                    href={`/category/${slugify(category)}`}
                    className="group block p-6 bg-background border border-border rounded-md transition-all hover:border-foreground/30 hover:shadow-lg hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-foreground transition-colors">
                      {category}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Expert insights and analysis
                    </p>
                    <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
