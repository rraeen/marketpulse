"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";

interface PostCardFullProps {
  id: string;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryId: string;
  publishedAt: string;
  index?: number;
}

export const PostCardFull = memo(function PostCardFull({
  id,
  title,
  body,
  featuredImageUrl,
  categoryId,
  publishedAt,
  index = 0,
}: PostCardFullProps) {
  // Create excerpt from body (strip HTML and limit to 200 chars)
  const excerpt = body
    .replace(/<[^>]*>/g, "")
    .substring(0, 200)
    .trim() + (body.length > 200 ? "..." : "");

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="w-full"
    >
      <Link
        href={`/post/${id}`}
        className="group block bg-background border border-border rounded-lg overflow-hidden transition-all hover:border-foreground/30 hover:shadow-lg"
      >
        {/* Featured Image - Full Width */}
        {featuredImageUrl && (
          <div className="relative w-full aspect-[21/9] bg-muted overflow-hidden">
            <Image
              src={featuredImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Category Badge & Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full">
              {categoryId}
            </span>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {formattedDate}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 line-clamp-2 group-hover:text-foreground transition-colors">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground text-base md:text-lg mb-6 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>

          {/* Read More Link */}
          <div className="flex items-center text-sm font-medium text-foreground group-hover:gap-2 transition-all">
            Read Full Article
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
});
