"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { Plus, Loader2, ChevronDown, ChevronRight, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Category, CategoryTree } from "@/lib/types/category";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: "", parentId: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleOpenCreate = () => {
    setFormData({ name: "", parentId: "" });
    setFormErrors({});
    setServerError("");
    setShowCreateModal(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, parentId: category.parentId || "" });
    setFormErrors({});
    setServerError("");
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    setDeletingCategory(null);
    setFormData({ name: "", parentId: "" });
    setFormErrors({});
    setServerError("");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Name must be less than 100 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setServerError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          parentId: formData.parentId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to create category");
        return;
      }

      await fetchCategories();
      handleCloseModals();
    } catch (error) {
      setServerError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !validateForm()) return;

    setIsSaving(true);
    setServerError("");

    try {
      const res = await fetch(`/api/admin/categories/${editingCategory._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          parentId: formData.parentId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to update category");
        return;
      }

      await fetchCategories();
      handleCloseModals();
    } catch (error) {
      setServerError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to delete category");
        return;
      }

      await fetchCategories();
      handleCloseModals();
    } catch (error) {
      setServerError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (categoryId: string, direction: "up" | "down") => {
    const mainCategories = categories.filter((c) => !c.parentId);
    const currentIndex = mainCategories.findIndex((c) => c._id === categoryId);
    
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === mainCategories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...mainCategories];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

    try {
      const res = await fetch("/api/admin/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryIds: reordered.map((c) => c._id),
        }),
      });

      if (res.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error reordering:", error);
    }
  };

  if (authLoading || (isLoading && user?.role === "Admin")) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return null;
  }

  const mainCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
                Category Management
              </h1>
              <p className="text-muted-foreground">
                Manage categories and subcategories for your content
              </p>
            </div>
            <Button size="lg" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Create Category
            </Button>
          </div>

          {/* Category List */}
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            {mainCategories.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No categories yet</p>
                <Button onClick={handleOpenCreate}>Create your first category</Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {mainCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category._id);
                  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

                  return (
                    <div key={category._id}>
                      {/* Main Category Row */}
                      <div className="p-4 hover:bg-muted/30 transition-colors flex items-center gap-4">
                        {/* Expand/Collapse */}
                        <button
                          onClick={() => toggleExpand(category._id)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          disabled={!hasSubcategories}
                        >
                          {hasSubcategories ? (
                            isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </button>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{category.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              (Order: {category.order})
                            </span>
                            {hasSubcategories && (
                              <span className="text-xs text-muted-foreground">
                                • {category.subcategories!.length} subcategories
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">/{category.slug}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorder(category._id, "up")}
                            disabled={category.order === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorder(category._id, "down")}
                            disabled={category.order === mainCategories.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {isExpanded && hasSubcategories && (
                        <div className="bg-muted/20">
                          {category.subcategories!.map((sub) => (
                            <div
                              key={sub._id}
                              className="p-4 pl-16 hover:bg-muted/40 transition-colors flex items-center gap-4 border-t border-border/50"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">└─</span>
                                  <h4 className="font-medium">{sub.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                  /{category.slug}/{sub.slug}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEdit(sub)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingCategory(sub)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModals}
          title="Create Category"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Category Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={formErrors.name}
                placeholder="e.g., Stocks, Commodities"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Slug Preview
              </label>
              <div className="px-4 py-2 text-sm bg-muted border border-border rounded-md text-muted-foreground">
                /{generateSlug(formData.name) || "category-slug"}
              </div>
            </div>

            <div>
              <label htmlFor="parentId" className="block text-sm font-medium mb-1.5">
                Parent Category
              </label>
              <Select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                disabled={isSaving}
              >
                <option value="">None (Main Category)</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Leave empty to create a main category
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" isLoading={isSaving}>
                Create Category
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModals}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingCategory}
          onClose={handleCloseModals}
          title="Edit Category"
          size="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-1.5">
                Category Name *
              </label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={formErrors.name}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Slug Preview
              </label>
              <div className="px-4 py-2 text-sm bg-muted border border-border rounded-md text-muted-foreground">
                /{generateSlug(formData.name)}
              </div>
            </div>

            <div>
              <label htmlFor="edit-parentId" className="block text-sm font-medium mb-1.5">
                Parent Category
              </label>
              <Select
                id="edit-parentId"
                name="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                disabled={isSaving}
              >
                <option value="">None (Main Category)</option>
                {mainCategories
                  .filter((cat) => cat._id !== editingCategory?._id)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </Select>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" isLoading={isSaving}>
                Update Category
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModals}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={!!deletingCategory}
          onClose={handleCloseModals}
          title="Delete Category"
          size="sm"
        >
          <div className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {serverError}
              </div>
            )}

            <p className="text-sm">
              Are you sure you want to delete <strong>{deletingCategory?.name}</strong>?
            </p>

            {deletingCategory && !deletingCategory.parentId && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                Warning: This will also delete all subcategories under this category.
              </p>
            )}

            <div className="flex items-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleDelete}
                isLoading={isSaving}
                className="bg-red-600 text-white hover:bg-red-700 border-red-600"
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModals}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
