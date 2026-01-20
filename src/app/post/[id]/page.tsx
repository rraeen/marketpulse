import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { sanitizeHtml } from "@/lib/utils/html-sanitizer";
import { getPostById } from "@/lib/services/post";
import { getCategoryById } from "@/lib/services/category";

export const dynamic = "force-dynamic";

async function getPost(id: string) {
  try {
    const post = await getPostById(id);
    if (!post) {
      return null;
    }

    // Handle category lookup with error handling
    let categoryName = "Uncategorized";
    try {
      if (post.categoryId) {
        const category = await getCategoryById(post.categoryId.toString());
        categoryName = category?.name || "Uncategorized";
      }
    } catch (categoryError) {
      console.error("Error fetching category:", categoryError);
      // Continue with default category name
    }

    // Handle updatedAt - use createdAt as fallback if updatedAt doesn't exist
    const updatedAt = post.updatedAt || post.createdAt || new Date();

    return {
      _id: post._id?.toString() || "",
      title: post.title || "",
      body: post.body || "",
      featuredImageUrl: post.featuredImageUrl || undefined,
      categoryId: post.categoryId?.toString() || "",
      categoryName,
      status: post.status,
      updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    // Log more details in production for debugging
    if (process.env.NODE_ENV === "production") {
      console.error("Post ID:", id);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // IMPORTANT: Avoid DB calls here.
  // `generateMetadata` runs separately from the page render and can double
  // DB work on cold starts in production (leading to timeouts / 500s).
  return {
    title: `Post ${id} | MarketPulse`,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const post = await getPost(id);

    if (!post || post.status !== "Published") {
      notFound();
    }

    // Validate required fields
    if (!post.title || !post.body) {
      console.error("Post missing required fields:", { id, hasTitle: !!post.title, hasBody: !!post.body });
      notFound();
    }

    const formattedDate = new Date(post.updatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Sanitize HTML content (server-safe, no JSDOM dependency)
    const sanitizedBody = sanitizeHtml(post.body);

    return (
    <article className="flex-1 py-10 md:py-14">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {/* Category Badge */}
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-accent text-accent-foreground rounded-full">
              <Tag className="inline h-3 w-3 mr-1" />
              {post.categoryName}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1.5" />
              <time dateTime={post.updatedAt}>{formattedDate}</time>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImageUrl && (
            <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-muted">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                unoptimized={
                  post.featuredImageUrl.startsWith("data:") ||
                  post.featuredImageUrl.includes(".r2.cloudflarestorage.com") ||
                  post.featuredImageUrl.includes(".r2.dev")
                }
              />
            </div>
          )}

          {/* Content */}
          <div
            className="post-content prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </div>
      </Container>
    </article>
    );
  } catch (error) {
    console.error("Error rendering post page:", error);
    // Log detailed error in production for debugging
    if (process.env.NODE_ENV === "production") {
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    // Return 404 instead of 500 to avoid exposing errors
    notFound();
  }
}
