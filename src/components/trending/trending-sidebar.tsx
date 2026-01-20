"use client";

import { useEffect, useState } from "react";
import { TrendingHeader } from "./trending-header";
import { TrendingCard } from "./trending-card";
import { EmptyTrendingState } from "./empty-trending-state";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TrendingPost {
  _id: string;
  title: string;
  featuredImageUrl?: string;
  category?: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface TrendingSidebarProps {
  limit?: number;
}

export function TrendingSidebar({ limit = 5 }: TrendingSidebarProps) {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`/api/posts/trending?limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setTrendingPosts(data.trending || []);
        } else {
          setError("Failed to load trending posts");
        }
      } catch (err) {
        console.error("Error fetching trending posts:", err);
        setError("Failed to load trending posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  return (
    <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
      <div className="bg-background border border-border rounded-lg p-6">
        <TrendingHeader />

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse space-y-3"
              >
                <div className="aspect-video bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {error}
          </div>
        ) : trendingPosts.length === 0 ? (
          <EmptyTrendingState />
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {trendingPosts.map((post, index) => (
                <TrendingCard
                  key={post._id}
                  id={post._id}
                  title={post.title}
                  featuredImageUrl={post.featuredImageUrl}
                  categoryName={post.category?.name}
                  createdAt={post.createdAt}
                  index={index}
                />
              ))}
            </div>

            {/* View All Trending Button */}
            {trendingPosts.length >= limit && (
              <Link href="/trending" className="block">
                <Button
                  variant="outline"
                  className="w-full group border-yellow-400 hover:bg-yellow-400 hover:text-slate-900 transition-all"
                >
                  View All Trending
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
