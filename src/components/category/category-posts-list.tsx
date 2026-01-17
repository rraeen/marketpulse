"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PostCardFull } from "@/components/ui/post-card-full";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2 } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryId: string;
  updatedAt: string;
}

interface CategoryPostsListProps {
  categorySlug: string;
  subcategorySlug?: string;
  initialPosts: Post[];
  initialTotal: number;
}

const POSTS_PER_PAGE = 3;

export function CategoryPostsList({
  categorySlug,
  subcategorySlug,
  initialPosts,
  initialTotal,
}: CategoryPostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTotal > initialPosts.length);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const subcategoryParam = subcategorySlug ? `&subcategorySlug=${subcategorySlug}` : '';
      const res = await fetch(
        `/api/posts?categorySlug=${categorySlug}${subcategoryParam}&page=${nextPage}&limit=${POSTS_PER_PAGE}`
      );

      if (res.ok) {
        const data = await res.json();
        const newPosts = data.posts || [];

        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(posts.length + newPosts.length < data.total);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, subcategorySlug, page, hasMore, isLoading, posts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMorePosts]);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description={`There are no published posts yet. Check back soon for expert insights!`}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Posts List */}
      {posts.map((post, index) => (
        <PostCardFull
          key={post._id}
          id={post._id}
          title={post.title}
          body={post.body}
          featuredImageUrl={post.featuredImageUrl}
          categoryId={post.categoryId}
          publishedAt={post.updatedAt}
          index={index}
        />
      ))}

      {/* Loading Indicator */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="flex items-center justify-center py-8"
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more posts...</span>
            </div>
          )}
        </div>
      )}

      {/* End of List */}
      {!hasMore && posts.length > POSTS_PER_PAGE && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          You've reached the end of the posts
        </div>
      )}
    </div>
  );
}
