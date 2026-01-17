import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CategoryPostsList } from "@/components/category/category-posts-list";
import { ChevronRight } from "lucide-react";

async function getSubcategoryPosts(categorySlug: string, subSlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/posts?categorySlug=${categorySlug}&subcategorySlug=${subSlug}&page=1&limit=3`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching subcategory posts:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = await params;
  const data = await getSubcategoryPosts(slug, subSlug);

  if (!data || !data.subcategory) {
    return {
      title: "Subcategory Not Found",
    };
  }

  return {
    title: `${data.subcategory.name} | MarketPulse`,
    description: `Browse ${data.subcategory.name} posts in ${data.category.name}.`,
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = await params;
  const data = await getSubcategoryPosts(slug, subSlug);

  if (!data || !data.category || !data.subcategory) {
    notFound();
  }

  const { posts, total, category, subcategory } = data;

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/category/${category.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{subcategory.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {subcategory.name}
          </h1>
          <Link
            href={`/category/${category.slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg"
          >
            In {category.name}
          </Link>
        </div>

        {/* Posts List with Infinite Scroll */}
        <div className="max-w-4xl mx-auto">
          <CategoryPostsList
            categorySlug={category.slug}
            subcategorySlug={subcategory.slug}
            initialPosts={posts}
            initialTotal={total}
          />
        </div>
      </Container>
    </div>
  );
}
