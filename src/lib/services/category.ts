import { getDb } from '../db';
import { Category } from '../models/category';
import { ObjectId } from 'mongodb';

/**
 * Generate URL-friendly slug from category name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Get all active categories in tree structure
 */
export async function getCategoryTree() {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  // Get all active categories
  const allCategories = await categoriesCollection
    .find({ isActive: true })
    .toArray();

  // Separate main categories and subcategories
  const mainCategories = allCategories
    .filter((cat) => cat.parentId === null)
    .sort((a, b) => a.order - b.order);

  const subcategories = allCategories.filter((cat) => cat.parentId !== null);

  // Build tree structure
  return mainCategories.map((mainCat) => ({
    ...mainCat,
    subcategories: subcategories
      .filter((sub) => sub.parentId?.toString() === mainCat._id?.toString())
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

/**
 * Get all active categories for admin
 */
export async function getAllCategories() {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  // Only get active categories for admin management
  const allCategories = await categoriesCollection.find({ isActive: true }).toArray();

  const mainCategories = allCategories
    .filter((cat) => cat.parentId === null)
    .sort((a, b) => a.order - b.order);

  const subcategories = allCategories.filter((cat) => cat.parentId !== null);

  return mainCategories.map((mainCat) => ({
    ...mainCat,
    subcategories: subcategories
      .filter((sub) => sub.parentId?.toString() === mainCat._id?.toString())
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

/**
 * Create a new category
 */
export async function createCategory(
  name: string,
  parentId: ObjectId | null
): Promise<Category> {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  const slug = generateSlug(name);

  // Check slug uniqueness
  const existing = await categoriesCollection.findOne({ slug });
  if (existing) {
    throw new Error('Category with this slug already exists');
  }

  // If parentId provided, validate it
  if (parentId) {
    const parent = await categoriesCollection.findOne({ _id: parentId });
    if (!parent) {
      throw new Error('Parent category not found');
    }
    if (parent.parentId !== null) {
      throw new Error('Cannot create subcategory of a subcategory (max 1 level)');
    }
  }

  // Determine order for main categories
  let order = 0;
  if (!parentId) {
    const maxOrder = await categoriesCollection
      .find({ parentId: null })
      .sort({ order: -1 })
      .limit(1)
      .toArray();
    order = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0;
  }

  const newCategory: Category = {
    name,
    slug,
    parentId,
    order,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await categoriesCollection.insertOne(newCategory);
  newCategory._id = result.insertedId;

  return newCategory;
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  updates: { name?: string; parentId?: ObjectId | null }
): Promise<Category | null> {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
  if (!category) {
    throw new Error('Category not found');
  }

  const updateData: Partial<Category> = {
    updatedAt: new Date(),
  };

  // Update name and regenerate slug
  if (updates.name) {
    updateData.name = updates.name;
    updateData.slug = generateSlug(updates.name);

    // Check slug uniqueness (excluding current category)
    const existing = await categoriesCollection.findOne({
      slug: updateData.slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existing) {
      throw new Error('Category with this slug already exists');
    }
  }

  // Update parentId
  if (updates.parentId !== undefined) {
    // Check if category has children (cannot convert to subcategory)
    const hasChildren = await categoriesCollection.findOne({
      parentId: new ObjectId(id),
    });
    if (hasChildren && updates.parentId !== null) {
      throw new Error('Cannot convert main category with children to subcategory');
    }

    // Validate new parent
    if (updates.parentId) {
      const parent = await categoriesCollection.findOne({ _id: updates.parentId });
      if (!parent) {
        throw new Error('Parent category not found');
      }
      if (parent.parentId !== null) {
        throw new Error('Cannot create subcategory of a subcategory');
      }
      // Check circular reference
      if (parent._id?.toString() === id) {
        throw new Error('Category cannot be its own parent');
      }
    }

    updateData.parentId = updates.parentId;
  }

  const result = await categoriesCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  return result as Category | null;
}

/**
 * Delete a category (hard delete - removes from database)
 */
export async function deleteCategory(id: string): Promise<void> {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');
  const postsCollection = db.collection('posts');

  const category = await categoriesCollection.findOne({ _id: new ObjectId(id) });
  if (!category) {
    throw new Error('Category not found');
  }

  // Check if category has any posts (Draft or Published)
  const hasPosts = await postsCollection.findOne({
    categoryId: new ObjectId(id),
  });
  if (hasPosts) {
    throw new Error('Cannot delete category with active posts');
  }

  // If main category, also check if any subcategories have posts
  if (category.parentId === null) {
    const subcategories = await categoriesCollection
      .find({ parentId: new ObjectId(id) })
      .toArray();
    
    if (subcategories.length > 0) {
      const subcategoryIds = subcategories.map(sub => sub._id);
      const subcategoryHasPosts = await postsCollection.findOne({
        categoryId: { $in: subcategoryIds },
      });
      
      if (subcategoryHasPosts) {
        throw new Error('Cannot delete category because one or more subcategories have active posts');
      }
    }
  }

  // Hard delete the category (actually remove from database)
  await categoriesCollection.deleteOne(
    { _id: new ObjectId(id) }
  );

  // If main category, cascade delete to subcategories
  if (category.parentId === null) {
    await categoriesCollection.deleteMany(
      { parentId: new ObjectId(id) }
    );
  }
}

/**
 * Reorder main categories
 */
export async function reorderCategories(categoryIds: string[]): Promise<void> {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  // Update order for each category
  const updates = categoryIds.map((id, index) =>
    categoriesCollection.updateOne(
      { _id: new ObjectId(id), parentId: null },
      { $set: { order: index, updatedAt: new Date() } }
    )
  );

  await Promise.all(updates);
}

/**
 * Check if category has posts
 */
export async function categoryHasPosts(categoryId: ObjectId): Promise<boolean> {
  const db = await getDb();
  const postsCollection = db.collection('posts');

  const post = await postsCollection.findOne({ categoryId });
  return post !== null;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  return await categoriesCollection.findOne({ _id: new ObjectId(id) });
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = await getDb();
  const categoriesCollection = db.collection<Category>('categories');

  return await categoriesCollection.findOne({ slug, isActive: true });
}
