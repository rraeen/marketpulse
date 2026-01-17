export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
}

export interface CategoryTree extends Category {
  subcategories: Category[];
}
