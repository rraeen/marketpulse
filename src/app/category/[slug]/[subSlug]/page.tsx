import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CategoryPostsList } from "@/components/category/category-posts-list";
import { TrendingSidebar } from "@/components/trending/trending-sidebar";
import { ChevronRight } from "lucide-react";
import { getPostsByCategory } from "@/lib/services/post";
import { getCategoryBySlug } from "@/lib/services/category";
import type { Category as UiCategory } from "@/lib/types/category";
import type { Post as DbPost } from "@/lib/models/post";

export const dynamic = "force-dynamic";

async function getSubcategoryPosts(categorySlug: string, subSlug: string) {
  try {
    const categoryDb = await getCategoryBySlug(categorySlug);
    if (!categoryDb) {
      return null;
    }

    const subcategoryDb = await getCategoryBySlug(subSlug);
    if (!subcategoryDb) {
      return null;
    }

    if (subcategoryDb.parentId?.toString() !== categoryDb._id?.toString()) {
      return null;
    }

    const { posts, total } = await getPostsByCategory(subcategoryDb._id!, false, {
      page: 1,
      limit: 3,
    });

    const category: UiCategory = {
      _id: categoryDb._id?.toString() || "",
      name: categoryDb.name,
      slug: categoryDb.slug,
      parentId: categoryDb.parentId ? categoryDb.parentId.toString() : null,
      order: categoryDb.order,
      isActive: categoryDb.isActive,
      createdAt: categoryDb.createdAt.toISOString(),
      updatedAt: categoryDb.updatedAt.toISOString(),
    };

    const subcategory: UiCategory = {
      _id: subcategoryDb._id?.toString() || "",
      name: subcategoryDb.name,
      slug: subcategoryDb.slug,
      parentId: subcategoryDb.parentId ? subcategoryDb.parentId.toString() : null,
      order: subcategoryDb.order,
      isActive: subcategoryDb.isActive,
      createdAt: subcategoryDb.createdAt.toISOString(),
      updatedAt: subcategoryDb.updatedAt.toISOString(),
    };

    const postsUi = posts.map((post: DbPost) => ({
      _id: post._id?.toString() || "",
      title: post.title,
      body: post.body,
      featuredImageUrl: post.featuredImageUrl,
      categoryId: post.categoryId.toString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return {
      posts: postsUi,
      total,
      category,
      subcategory,
    };
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

        {/* Main Content + Trending Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            <CategoryPostsList
              categorySlug={category.slug}
              subcategorySlug={subcategory.slug}
              initialPosts={posts}
              initialTotal={total}
            />
          </div>

          {/* Trending Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <TrendingSidebar limit={5} />
          </div>
        </div>
      </Container>
    </div>
  );
}
