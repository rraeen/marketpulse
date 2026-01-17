import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PostCard } from "@/components/ui/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORIES } from "@/lib/constants/categories";

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

function unslugify(slug: string): string {
  return CATEGORIES.find((cat) => slugify(cat) === slug) || "";
}

async function getPosts(categoryId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/posts?categoryId=${categoryId}&limit=50`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { posts: [], total: 0, page: 1, limit: 50 };
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], total: 0, page: 1, limit: 50 };
  }
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: slugify(category),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = unslugify(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category} | MarketPulse`,
    description: `Browse ${category} insights and analysis from MarketPulse.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = unslugify(slug);

  if (!category) {
    notFound();
  }

  const { posts } = await getPosts(category);

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {category}
          </h1>
          <p className="text-muted-foreground text-lg">
            Expert insights and analysis in {category.toLowerCase()}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any, index: number) => (
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
        ) : (
          <EmptyState
            title="No posts yet"
            description={`There are no published posts in ${category} yet. Check back soon for expert insights!`}
          />
        )}
      </Container>
    </div>
  );
}
