import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CategoryPostsList } from "@/components/category/category-posts-list";
import { ChevronRight } from "lucide-react";
import { Category } from "@/lib/types/category";

async function getCategoryPosts(categorySlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/posts?categorySlug=${categorySlug}&page=1&limit=3`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching category posts:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryPosts(slug);

  if (!data || !data.category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${data.category.name} | MarketPulse`,
    description: `Browse ${data.category.name} insights and analysis from MarketPulse.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryPosts(slug);

  if (!data || !data.category) {
    notFound();
  }

  const { posts, total, category } = data;
  const subcategories: Category[] = category.subcategories || [];

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {category.name}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Expert insights and analysis in {category.name.toLowerCase()}
          </p>

          {/* Subcategory Filters */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by:</span>
              <Link
                href={`/category/${slug}`}
                className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-all"
              >
                All
              </Link>
              {subcategories.map((sub: Category) => (
                <Link
                  key={sub._id}
                  href={`/category/${slug}/${sub.slug}`}
                  className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-md hover:bg-foreground/10 transition-all"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Posts List with Infinite Scroll */}
        <div className="max-w-4xl mx-auto">
          <CategoryPostsList
            categorySlug={category.slug}
            initialPosts={posts}
            initialTotal={total}
          />
        </div>
      </Container>
    </div>
  );
}
