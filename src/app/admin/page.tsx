"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  categoryId: string;
  status: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        // Backend returns array directly when no pagination is used
        const postsArray = Array.isArray(data) ? data : (data.posts || []);
        setPosts(postsArray);
        console.log(`Fetched ${postsArray.length} posts (including drafts)`);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch posts' }));
        console.error("Error fetching posts:", errorData);
        alert(`Failed to load posts: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Failed to load posts. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const postId = String(id).trim();
    console.log("Deleting post - ID:", postId, "Type:", typeof postId);

    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });

      console.log("Delete response:", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
      });

      if (res.ok) {
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== id));
        console.log("Post deleted successfully");
      } else {
        let errorMessage = `Failed to delete post (${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
          console.error("Delete post error:", {
            status: res.status,
            errorData,
          });
        } catch (jsonError) {
          const text = await res.text().catch(() => '');
          errorMessage = text || errorMessage;
          console.error("Delete post error - non-JSON response:", {
            status: res.status,
            text: text.substring(0, 200),
          });
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      alert(`Error deleting post: ${errorMessage}`);
    }
  }, []);

  if (authLoading || (isLoading && user?.role === "Admin")) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return null;
  }

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Content Management
            </h1>
            <p className="text-muted-foreground mb-6">
              Manage your posts and content
            </p>
            <div className="flex items-center gap-4">
              <Link href="/admin/posts/new">
                <Button size="lg">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button size="lg" variant="outline">
                  Manage Categories
                </Button>
              </Link>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            {posts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                <Link href="/admin/posts/new">
                  <Button>Create your first post</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-1">{post.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent">
                          {post.categoryId}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            post.status === "Published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {post.status}
                        </span>
                        <span>
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.status === "Published" && (
                        <Link href={`/post/${post._id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/posts/${post._id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
