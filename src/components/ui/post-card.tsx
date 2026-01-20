"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LazyImage } from "./lazy-image";

interface PostCardProps {
  id: string;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryName?: string;
  publishedAt: string;
  index?: number;
}

export const PostCard = memo(function PostCard({
  id,
  title,
  body,
  featuredImageUrl,
  categoryName,
  publishedAt,
  index = 0,
}: PostCardProps) {
  // Create excerpt from body (strip HTML and limit to 150 chars)
  const excerpt = body
    .replace(/<[^>]*>/g, "")
    .substring(0, 150)
    .trim() + (body.length > 150 ? "..." : "");

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
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/post/${id}`}
        className="group block bg-background border border-border rounded-lg overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md"
      >
        {/* Featured Image */}
        {featuredImageUrl && (
          <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
            <LazyImage
              src={featuredImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={
                featuredImageUrl.startsWith("data:") ||
                featuredImageUrl.includes(".r2.cloudflarestorage.com") ||
                featuredImageUrl.includes(".r2.dev")
              }
              priority={index < 3}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="inline-block px-3 py-1 mb-3 text-xs font-medium bg-accent text-accent-foreground rounded-full">
            {categoryName || "Uncategorized"}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-foreground transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{excerpt}</p>

          {/* Date */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {formattedDate}
          </div>
        </div>
      </Link>
    </motion.article>
  );
});
