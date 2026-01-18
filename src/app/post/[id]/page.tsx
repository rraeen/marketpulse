import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import DOMPurify from "isomorphic-dompurify";
import { getPostById } from "@/lib/services/post";
import { getCategoryById } from "@/lib/services/category";

export const dynamic = "force-dynamic";

async function getPost(id: string) {
  try {
    const post = await getPostById(id);
    if (!post) {
      return null;
    }

    const category = await getCategoryById(post.categoryId.toString());

    return {
      _id: post._id?.toString() || "",
      title: post.title,
      body: post.body,
      featuredImageUrl: post.featuredImageUrl,
      categoryId: post.categoryId.toString(),
      categoryName: category?.name || "Uncategorized",
      status: post.status,
      updatedAt: post.updatedAt.toISOString(),
    };
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
  console.log("generateMetadata - Post:", post);

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
      "b",
      "i",
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
      "div",
      "span",
      "section",
      "article",
      "header",
      "footer",
      "main",
      "aside",
      "img",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "width",
      "height",
      "class",
      "style",
    ],
    ALLOW_DATA_ATTR: false,
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
              />
            </div>
          )}

          {/* Content */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .post-content h1 {
                font-size: 2.25rem;
                font-weight: 700;
                margin-top: 2rem;
                margin-bottom: 1rem;
                line-height: 1.2;
                color: hsl(var(--foreground));
              }
              .post-content h2 {
                font-size: 1.875rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                line-height: 1.3;
                color: hsl(var(--foreground));
              }
              .post-content h3 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 1.25rem;
                margin-bottom: 0.5rem;
                line-height: 1.4;
                color: hsl(var(--foreground));
              }
              .post-content h4 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 1rem;
                margin-bottom: 0.5rem;
                line-height: 1.4;
                color: hsl(var(--foreground));
              }
              .post-content h5 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-top: 0.75rem;
                margin-bottom: 0.5rem;
                line-height: 1.5;
                color: hsl(var(--foreground));
              }
              .post-content h6 {
                font-size: 1rem;
                font-weight: 600;
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
                line-height: 1.5;
                color: hsl(var(--foreground));
              }
              .post-content p {
                margin-top: 1rem;
                margin-bottom: 1rem;
                line-height: 1.75;
                color: hsl(var(--foreground) / 0.9);
              }
              .post-content ul, .post-content ol {
                margin-top: 1rem;
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              .post-content ul {
                list-style-type: disc;
              }
              .post-content ol {
                list-style-type: decimal;
              }
              .post-content li {
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
                color: hsl(var(--foreground) / 0.9);
              }
              .post-content a {
                color: hsl(var(--foreground));
                text-decoration: underline;
                text-decoration-color: hsl(var(--muted-foreground));
              }
              .post-content a:hover {
                text-decoration-color: hsl(var(--foreground));
              }
              .post-content strong {
                font-weight: 600;
                color: hsl(var(--foreground));
              }
              .post-content em {
                font-style: italic;
                color: hsl(var(--foreground));
              }
              .post-content blockquote {
                border-left: 4px solid hsl(var(--muted-foreground));
                padding-left: 1rem;
                font-style: italic;
                margin-top: 1rem;
                margin-bottom: 1rem;
                color: hsl(var(--foreground) / 0.8);
              }
              .post-content code {
                background-color: hsl(var(--muted));
                padding: 0.125rem 0.375rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                font-family: ui-monospace, monospace;
                color: hsl(var(--foreground));
              }
              .post-content pre {
                background-color: hsl(var(--muted));
                border: 1px solid hsl(var(--border));
                border-radius: 0.5rem;
                padding: 1rem;
                overflow-x: auto;
                margin-top: 1rem;
                margin-bottom: 1rem;
              }
              .post-content pre code {
                background-color: transparent;
                padding: 0;
              }
              .post-content img {
                border-radius: 0.5rem;
                margin-top: 1rem;
                margin-bottom: 1rem;
                max-width: 100%;
                height: auto;
              }
              .post-content hr {
                border: none;
                border-top: 1px solid hsl(var(--border));
                margin-top: 2rem;
                margin-bottom: 2rem;
              }
              /* Support for Tailwind-like utility classes */
              .post-content section {
                display: block !important;
                margin: 2rem 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
              }
              /* Background gradients - apply when bg-gradient-to-br is present */
              .post-content .bg-gradient-to-br,
              .post-content section.bg-gradient-to-br,
              .post-content div.bg-gradient-to-br {
                background-image: linear-gradient(to bottom right, #0f172a, #1e293b, #334155) !important;
                background-color: #0f172a !important;
                background: linear-gradient(to bottom right, #0f172a, #1e293b, #334155) !important;
              }
              /* Ensure section with gradient classes gets the background */
              .post-content section[class*="bg-gradient"],
              .post-content section[class*="from-slate"],
              .post-content section[class*="via-slate"],
              .post-content section[class*="to-slate"] {
                background-image: linear-gradient(to bottom right, #0f172a, #1e293b, #334155) !important;
                background-color: #0f172a !important;
                background: linear-gradient(to bottom right, #0f172a, #1e293b, #334155) !important;
              }
              .post-content .text-white {
                color: white !important;
              }
              .post-content .text-slate-200 {
                color: #e2e8f0 !important;
              }
              .post-content .text-yellow-400 {
                color: #facc15 !important;
              }
              .post-content .text-slate-900 {
                color: #0f172a !important;
              }
              .post-content .bg-yellow-400 {
                background-color: #facc15 !important;
              }
              .post-content a.bg-yellow-400:hover,
              .post-content .bg-yellow-400:hover {
                background-color: #fde047 !important;
              }
              .post-content .font-bold {
                font-weight: 700 !important;
              }
              .post-content .font-semibold {
                font-weight: 600 !important;
              }
              .post-content .text-4xl {
                font-size: 2.25rem !important;
                line-height: 2.5rem !important;
              }
              .post-content .text-lg {
                font-size: 1.125rem !important;
                line-height: 1.75rem !important;
              }
              .post-content .py-20 {
                padding-top: 5rem !important;
                padding-bottom: 5rem !important;
              }
              .post-content .px-6 {
                padding-left: 1.5rem !important;
                padding-right: 1.5rem !important;
              }
              .post-content .px-8 {
                padding-left: 2rem !important;
                padding-right: 2rem !important;
              }
              .post-content .py-3 {
                padding-top: 0.75rem !important;
                padding-bottom: 0.75rem !important;
              }
              .post-content .mb-4 {
                margin-bottom: 1rem !important;
              }
              .post-content .mb-8 {
                margin-bottom: 2rem !important;
              }
              .post-content .text-center {
                text-align: center !important;
              }
              .post-content .max-w-3xl {
                max-width: 48rem !important;
              }
              .post-content .mx-auto {
                margin-left: auto !important;
                margin-right: auto !important;
              }
              .post-content .leading-relaxed {
                line-height: 1.625 !important;
              }
              .post-content .inline-block {
                display: inline-block !important;
              }
              .post-content .rounded-lg {
                border-radius: 0.5rem !important;
              }
              .post-content .transition {
                transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
                transition-duration: 150ms !important;
              }
            `
          }} />
          <div
            className="post-content prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </div>
      </Container>
    </article>
  );
}
