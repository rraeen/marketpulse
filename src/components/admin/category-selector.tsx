"use client";

import React, { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CategoryTree } from "@/lib/types/category";

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  error,
  disabled,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Use public API to get only active categories for post assignment
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        setLoadError("Failed to load categories");
      }
    } catch (error) {
      setLoadError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading categories...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
        <button
          onClick={fetchCategories}
          className="text-sm text-foreground underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground bg-muted border border-border rounded-md">
        No categories available. Please create categories first.
      </div>
    );
  }

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      disabled={disabled}
    >
      <option value="">Select Category</option>
      {categories.map((category) => (
        <React.Fragment key={category._id}>
          <option value={category._id}>
            {category.name}
          </option>
          {category.subcategories &&
            category.subcategories.map((sub) => (
              <option
                key={sub._id}
                value={sub._id}
                className="subcategory-option"
              >
                &nbsp;&nbsp;└─ {sub.name}
              </option>
            ))}
        </React.Fragment>
      ))}
    </Select>
  );
}
