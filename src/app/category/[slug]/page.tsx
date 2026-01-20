import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CategoryPostsList } from "@/components/category/category-posts-list";
import { TrendingSidebar } from "@/components/trending/trending-sidebar";
import { ChevronRight } from "lucide-react";
import { Category } from "@/lib/types/category";
import { getPostsByCategory } from "@/lib/services/post";
import { getCategoryBySlug } from "@/lib/services/category";
import { getDb } from "@/lib/db";
import type { Category as DbCategory } from "@/lib/models/category";
import type { Post as DbPost } from "@/lib/models/post";

export const dynamic = "force-dynamic";

async function getCategoryPosts(categorySlug: string) {
  try {
    const categoryDb = await getCategoryBySlug(categorySlug);
    if (!categoryDb) {
      return null;
    }

    const { posts, total } = await getPostsByCategory(categoryDb._id!, true, {
      page: 1,
      limit: 3,
    });

    const db = await getDb();
    const subcategoriesDb = await db
      .collection<DbCategory>("categories")
      .find({ parentId: categoryDb._id, isActive: true })
      .sort({ name: 1 })
      .toArray();

    const category: Category = {
      _id: categoryDb._id?.toString() || "",
      name: categoryDb.name,
      slug: categoryDb.slug,
      parentId: categoryDb.parentId ? categoryDb.parentId.toString() : null,
      order: categoryDb.order,
      isActive: categoryDb.isActive,
      createdAt: categoryDb.createdAt.toISOString(),
      updatedAt: categoryDb.updatedAt.toISOString(),
    };

    const subcategories: Category[] = subcategoriesDb.map((sub) => ({
      _id: sub._id?.toString() || "",
      name: sub.name,
      slug: sub.slug,
      parentId: sub.parentId ? sub.parentId.toString() : null,
      order: sub.order,
      isActive: sub.isActive,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    }));

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
      subcategories,
    };
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

  const { posts, total, category, subcategories } = data;
  const subcategoriesList: Category[] = subcategories || [];

  return (
    <div className="flex-1 py-12 md:py-5">
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
          {/* <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {category.name}
          </h1> */}
          {/* <p className="text-muted-foreground text-lg mb-6">
            Expert insights and analysis in {category.name.toLowerCase()}
          </p> */}

          {/* Subcategory Filters */}
          {subcategoriesList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by:</span>
              <Link
                href={`/category/${slug}`}
                className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-all"
              >
                All
              </Link>
              {subcategoriesList.map((sub: Category) => (
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

        {/* Main Content + Trending Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            <CategoryPostsList
              categorySlug={category.slug}
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
