"use client";

import { Search } from "lucide-react";

export function EmptyTrendingState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        No trending posts yet
      </h3>
      <p className="text-xs text-muted-foreground">
        Check back soon for trending content!
      </p>
    </div>
  );
}
