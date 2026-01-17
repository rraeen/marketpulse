"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CategorySelector } from "@/components/admin/category-selector";
import { TrendingToggle } from "@/components/admin/trending-toggle";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2, Upload, X } from "lucide-react";
import { use } from "react";

interface PostFormData {
  title: string;
  body: string;
  categoryId: string;
  status: "Draft" | "Published";
  featuredImageUrl?: string;
  isTrending?: boolean;
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    body: "",
    categoryId: "",
    status: "Draft",
    featuredImageUrl: "",
    isTrending: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchPost = useCallback(async () => {
    // Ensure ID is a string and properly formatted
    const postId = String(id).trim();
    console.log("Frontend fetchPost - ID:", postId, "Type:", typeof postId, "Length:", postId.length, "URL:", `/api/admin/posts/${postId}`);
    
    if (!postId || postId === 'undefined' || postId === 'null') {
      console.error("Frontend fetchPost - Invalid ID:", id);
      setServerError("Invalid post ID");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(postId)}`);
      console.log("Frontend fetchPost - Response status:", res.status, "OK:", res.ok);
      if (res.ok) {
        const post = await res.json();
        console.log("Frontend fetchPost - Post received:", post._id, "Status:", post.status);
        setFormData({
          title: post.title,
          body: post.body,
          categoryId: post.categoryId,
          status: post.status,
          featuredImageUrl: post.featuredImageUrl || "",
          isTrending: post.isTrending || false,
        });
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch post' }));
        console.error("Frontend fetchPost - Error response:", {
          status: res.status,
          statusText: res.statusText,
          errorData,
        });
        setServerError(errorData.error || `Failed to load post (${res.status})`);
      }
    } catch (error) {
      console.error("Frontend fetchPost - Exception:", error);
      setServerError("Failed to load post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user?.role === "Admin" && id !== "new") {
      fetchPost();
    } else if (id === "new") {
      setIsLoading(false);
    }
  }, [user, id, fetchPost]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, PNG, and WebP images are allowed",
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image must be less than 5MB",
      }));
      return;
    }

    setIsUploading(true);
    setErrors((prev) => ({ ...prev, image: "" }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setFormData((prev) => ({ ...prev, featuredImageUrl: data.url }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image. Please try again.";
      setErrors((prev) => ({
        ...prev,
        image: errorMessage,
      }));
      console.error("Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Content is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      console.log("Form validation failed");
      return;
    }

    setIsSaving(true);

    try {
      const postId = String(id).trim();
      const url = id === "new" ? "/api/admin/posts" : `/api/admin/posts/${encodeURIComponent(postId)}`;
      const method = id === "new" ? "POST" : "PATCH";

      console.log("Submitting post:", {
        id: postId,
        url,
        method,
        status: formData.status,
        title: formData.title.substring(0, 30),
        hasBody: !!formData.body,
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Submit response:", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
      });

      if (!res.ok) {
        // Try to parse error response, handle empty or invalid JSON
        let errorMessage = `Failed to save post (${res.status})`;
        try {
          const errorData = await res.json();
          // Check if errorData has meaningful content
          if (errorData && typeof errorData === 'object') {
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (Object.keys(errorData).length > 0) {
              // Log the full error object if it has properties
              console.error("Save post error - full response:", {
                status: res.status,
                statusText: res.statusText,
                data: errorData,
              });
              errorMessage = JSON.stringify(errorData);
            } else {
              // Empty object - log more details
              console.error("Save post error - empty response:", {
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers.entries()),
              });
            }
          }
        } catch (jsonError) {
          // Response is not JSON or is empty
          try {
            const text = await res.text();
            errorMessage = text || errorMessage;
            console.error("Save post error - non-JSON response:", {
              status: res.status,
              statusText: res.statusText,
              text: text.substring(0, 200), // First 200 chars
            });
          } catch (textError) {
            console.error("Save post error - cannot read response:", {
              status: res.status,
              statusText: res.statusText,
              error: textError,
            });
          }
        }
        setServerError(errorMessage);
        return;
      }

      const data = await res.json();
      router.push("/admin");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setServerError(errorMessage);
      console.error("Save post exception:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
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
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              {id === "new" ? "Create New Post" : "Edit Post"}
            </h1>
            <p className="text-muted-foreground">
              {id === "new"
                ? "Create a new post for your audience"
                : "Update your post content"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {serverError}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1.5">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Enter post title"
                disabled={isSaving}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium mb-1.5">
                Category *
              </label>
              <CategorySelector
                value={formData.categoryId}
                onChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                error={errors.categoryId}
                disabled={isSaving}
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Featured Image
              </label>
              {formData.featuredImageUrl ? (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted border border-border">
                  <Image
                    src={formData.featuredImageUrl}
                    alt="Featured"
                    fill
                    className="object-cover"
                    unoptimized={formData.featuredImageUrl.startsWith('data:')}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, featuredImageUrl: "" }))
                    }
                    className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-md hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={isUploading || isSaving}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-foreground/30 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, or WebP (max 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              )}
              {errors.image && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {errors.image}
                </p>
              )}
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium mb-1.5">
                Content * (HTML supported)
              </label>
              <Textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                error={errors.body}
                placeholder="Enter post content (HTML tags are supported)"
                disabled={isSaving}
                rows={15}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;,
                &lt;h2&gt;, &lt;ul&gt;, &lt;ol&gt;, etc.
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1.5">
                Status *
              </label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSaving}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Draft posts are not visible to the public
              </p>
            </div>

            {/* Trending Toggle */}
            {id !== "new" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Trending Status
                </label>
                <div className="flex items-center gap-3 p-4 border border-border rounded-md bg-muted/30">
                  <TrendingToggle
                    postId={id}
                    isTrending={formData.isTrending || false}
                    onToggle={(postId, newValue) => {
                      setFormData((prev) => ({ ...prev, isTrending: newValue }));
                    }}
                    size="md"
                    showLabel={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    This post will appear in the trending sidebar on category pages
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" size="lg" isLoading={isSaving}>
                {id === "new" ? "Create Post" : "Update Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push("/admin")}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </Container>
    </div>
  );
}
