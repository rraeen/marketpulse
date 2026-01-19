"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Search as SearchIcon, User, LogOut, ChevronDown, Settings } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { CategoryTree } from "@/lib/types/category";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "next-themes";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredMore, setHoveredMore] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleCategoryMouseEnter = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(categoryId);
  };

  const handleCategoryMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const handleMoreMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredMore(true);
  };

  const handleMoreMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMore(false);
    }, 300);
  };

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

  const mainCategories = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const firstThree = mainCategories.slice(0, 3);
  const remaining = mainCategories.slice(3);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "navbar-light-mode",
        isScrolled && "backdrop-blur-md shadow-sm"
      )}
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0,
        backgroundColor: mounted && theme !== "dark" ? (isScrolled ? "rgba(22, 33, 62, 0.95)" : "#16213e") : undefined
      } as React.CSSProperties}
    >
      <Container>
        <nav className="flex h-16 items-center gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-70"
          >
            <Image
              src="/logo.png"
              alt="MarketPulse"
              width={140}
              height={40}
              className="h-8 w-auto brightness-0 invert dark:brightness-100 dark:invert-0"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            {/* First 3 Categories */}
            {firstThree.map((category) => {
              const isActive = pathname.startsWith(`/category/${category.slug}`);
              const hasSubcategories = category.subcategories && category.subcategories.length > 0;

              return (
                <div
                  key={category._id}
                  className="relative"
                  onMouseEnter={() => handleCategoryMouseEnter(category._id)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <Link
                    href={`/category/${category.slug}`}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-yellow-400 whitespace-nowrap",
                      isActive ? "text-yellow-400" : "text-muted-foreground"
                    )}
                  >
                    {category.name}
                    {hasSubcategories && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>

                  {/* Subcategory Dropdown */}
                  {hasSubcategories && hoveredCategory === category._id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
                      onMouseEnter={() => handleCategoryMouseEnter(category._id)}
                      onMouseLeave={handleCategoryMouseLeave}
                    >
                      <div className="max-h-[200px] overflow-y-auto">
                        {category.subcategories!.map((sub) => {
                          const isSubActive = pathname === `/category/${category.slug}/${sub.slug}`;
                          return (
                            <Link
                              key={sub._id}
                              href={`/category/${category.slug}/${sub.slug}`}
                              className={cn(
                                "block px-4 py-2 text-sm hover:text-yellow-400 transition-colors",
                                isSubActive ? "text-yellow-400" : "text-muted-foreground"
                              )}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                      {category.subcategories!.length > 5 && (
                        <div className="text-center py-1 text-xs text-white/70 dark:text-muted-foreground border-t border-white/20 dark:border-border">
                          <ChevronDown className="h-3 w-3 mx-auto text-white/70 dark:text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* More Dropdown */}
            {remaining.length > 0 && (
              <div
                className="relative"
                onMouseEnter={handleMoreMouseEnter}
                onMouseLeave={handleMoreMouseLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors hover:text-yellow-400",
                    hoveredMore ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  More
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {hoveredMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-[#16213e] dark:bg-background border border-white/20 dark:border-border rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
                    onMouseEnter={handleMoreMouseEnter}
                    onMouseLeave={handleMoreMouseLeave}
                  >
                    {remaining.map((category) => {
                      const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                      const isActive = pathname.startsWith(`/category/${category.slug}`);

                      return (
                        <div key={category._id}>
                          <Link
                            href={`/category/${category.slug}`}
                            className={cn(
                              "block px-4 py-2 text-sm font-medium hover:text-yellow-400 transition-colors",
                              isActive ? "text-yellow-400" : "text-muted-foreground"
                            )}
                          >
                            {category.name}
                          </Link>
                          {hasSubcategories && (
                            <div className="bg-muted/30">
                              {category.subcategories!.map((sub) => {
                                const isSubActive = pathname === `/category/${category.slug}/${sub.slug}`;
                                return (
                                  <Link
                                    key={sub._id}
                                    href={`/category/${category.slug}/${sub.slug}`}
                                    className={cn(
                                      "block px-4 py-2 pl-8 text-sm hover:text-yellow-400 transition-colors",
                                      isSubActive ? "text-yellow-400" : "text-muted-foreground"
                                    )}
                                  >
                                    └─ {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:block lg:hidden flex-1 max-w-xs mx-4">
            <Suspense fallback={<div className="h-10" />}>
              <SearchInput />
            </Suspense>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme Toggle - Admin Only */}
            {user?.role === "Admin" && <ThemeToggle />}
            
            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {user.role === "Admin" && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm" className="bg-transparent hover:bg-yellow-400 text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="bg-transparent hover:bg-yellow-400 text-muted-foreground hover:text-foreground">
                      <User className="h-4 w-4" />
                      {user.name}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-transparent hover:bg-yellow-400 text-muted-foreground hover:text-foreground"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium transition-colors hover:text-yellow-400 text-muted-foreground">
                    Sign In
                  </Link>
                  <span className="text-red-500 dark:text-red-400">/</span>
                  <Link href="/register" className="text-sm font-medium transition-colors hover:text-yellow-400 text-muted-foreground">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Search Button - Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-white dark:text-foreground hover:bg-white/10 dark:hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-border overflow-hidden"
              >
                <div className="p-4">
                  <Suspense fallback={<div className="h-10" />}>
                    <SearchInput />
                  </Suspense>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-background/95 backdrop-blur-md md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 w-64 bg-[#16213e] dark:bg-background border-l border-white/20 dark:border-border md:hidden z-50 overflow-y-auto"
            >
              <nav className="flex flex-col p-6 gap-2">
                {/* Mobile Categories */}
                {mainCategories.map((category, index) => {
                  const isExpanded = expandedCategories.has(category._id);
                  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                  const isActive = pathname.startsWith(`/category/${category.slug}`);

                  return (
                    <div key={category._id}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-2">
                          {hasSubcategories && (
                            <button
                              onClick={() => toggleExpand(category._id)}
                              className="p-1"
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded ? "rotate-0" : "-rotate-90"
                                )}
                              />
                            </button>
                          )}
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex-1 py-2 text-base font-medium hover:text-yellow-400 dark:hover:text-yellow-400 transition-colors",
                              isActive ? "text-yellow-400 dark:text-yellow-400" : "text-white dark:text-foreground"
                            )}
                          >
                            {category.name}
                          </Link>
                        </div>
                      </motion.div>

                      {/* Mobile Subcategories */}
                      {isExpanded && hasSubcategories && (
                        <div className="ml-6 mt-1 space-y-1">
                          {category.subcategories!.map((sub) => {
                            const isSubActive = pathname === `/category/${category.slug}/${sub.slug}`;
                            return (
                              <Link
                                key={sub._id}
                                href={`/category/${category.slug}/${sub.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  "block py-2 text-sm hover:text-yellow-400 transition-colors",
                                  isSubActive ? "text-yellow-400" : "text-muted-foreground"
                                )}
                              >
                                └─ {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Mobile Auth Actions */}
                <div className="border-t border-border pt-4 mt-2 space-y-2">
                  {/* Theme Toggle - Mobile - Admin Only */}
                  {user?.role === "Admin" && (
                    <div className="flex items-center justify-between px-2 py-2">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                  )}
                  
                  {user ? (
                    <>
                      {user.role === "Admin" && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start bg-transparent hover:bg-yellow-400 text-muted-foreground hover:text-foreground">
                            <Settings className="h-4 w-4" />
                            Settings
                          </Button>
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start bg-transparent hover:bg-yellow-400 text-muted-foreground hover:text-foreground">
                          <User className="h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start bg-transparent hover:bg-yellow-400 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-yellow-400 text-muted-foreground py-2 block">
                        Sign In
                      </Link>
                      <div className="flex items-center justify-center gap-2 py-2">
                        <span className="text-red-500 dark:text-red-400">/</span>
                      </div>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium transition-colors hover:text-yellow-400 text-muted-foreground py-2 block">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
