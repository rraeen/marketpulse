import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import DOMPurify from "isomorphic-dompurify";

async function getPost(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/posts/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | MarketPulse`,
    description: post.body.replace(/<[^>]*>/g, "").substring(0, 160),
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post || post.status !== "Published") {
    notFound();
  }

  const formattedDate = new Date(post.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Sanitize HTML content
  const sanitizedBody = DOMPurify.sanitize(post.body, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <article className="flex-1 py-12 md:py-16">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {/* Category Badge */}
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-accent text-accent-foreground rounded-full">
              <Tag className="inline h-3 w-3 mr-1" />
              {post.categoryId}
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
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-foreground prose-a:underline prose-a:decoration-muted-foreground hover:prose-a:decoration-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </div>
      </Container>
    </article>
  );
}
