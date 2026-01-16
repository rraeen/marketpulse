"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PostCard } from "@/components/ui/post-card";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchPosts() {
      if (!query.trim()) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);

        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to load search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    searchPosts();
  }, [query]);

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Search Results
          </h1>
          {query && (
            <p className="text-muted-foreground text-lg">
              Showing results for <span className="font-medium text-foreground">&quot;{query}&quot;</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <EmptyState
            title="Something went wrong"
            description={error}
          />
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {posts.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Found {posts.length} {posts.length === 1 ? "result" : "results"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <PostCard
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
                </div>
              </>
            ) : query ? (
              <EmptyState
                title="No results found"
                description={`We couldn't find any posts matching "${query}". Try different keywords or browse our categories.`}
              />
            ) : (
              <EmptyState
                title="Start searching"
                description="Enter a keyword to search for posts across all categories."
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 py-12 md:py-16">
        <Container>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Container>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
