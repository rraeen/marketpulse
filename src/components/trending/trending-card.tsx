"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LazyImage } from "@/components/ui/lazy-image";

interface TrendingCardProps {
  id: string;
  title: string;
  featuredImageUrl?: string;
  categoryName?: string;
  createdAt: string;
  index?: number;
}

export const TrendingCard = memo(function TrendingCard({
  id,
  title,
  featuredImageUrl,
  categoryName,
  createdAt,
  index = 0,
}: TrendingCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeAgo = getTimeAgo(createdAt);

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      <Link
        href={`/post/${id}`}
        className={cn(
          "group block bg-background border border-border rounded-lg overflow-hidden",
          "transition-all duration-300 hover:border-yellow-400 hover:shadow-lg hover:translate-x-1"
        )}
      >
        {/* Image */}
        {featuredImageUrl && (
          <div className="relative w-full aspect-video bg-muted overflow-hidden">
            <LazyImage
              src={featuredImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={
                featuredImageUrl.startsWith("data:") ||
                featuredImageUrl.includes(".r2.cloudflarestorage.com") ||
                featuredImageUrl.includes(".r2.dev")
              }
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            {/* Trending Badge */}
            <div className="absolute top-2 right-2 bg-yellow-400/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 z-10">
              <Star className="h-3 w-3 fill-white" />
              Trending
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Title with Star */}
          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-foreground transition-colors flex items-start gap-1.5">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mt-0.5 flex-shrink-0" />
            <span>{title}</span>
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {categoryName && (
              <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full font-medium">
                {categoryName}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}
