# Frontend Story 02 - Category Page with Trending Sidebar (2/3 + 1/3 Layout)

## Story ID
FE-TREND-02

## Story Title
As a frontend developer, I need to create an **attractive** category page with a 2/3 main content area and 1/3 trending sidebar that provides an excellent user experience.

## Priority
**HIGH - UI/UX CRITICAL**

## Story Points
13

## ⚠️ IMPORTANT: UI/UX is CRITICAL
This feature is the centerpiece of the user experience. The UI MUST be:
- **Visually Stunning:** Professional, modern, attractive design
- **Engaging:** Draw users' attention to trending content
- **Responsive:** Perfect on all devices
- **Smooth:** Butter-smooth animations and transitions
- **Polished:** Every detail matters

---

## 🎨 Visual Design Specifications

### Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Navbar with Categories]                                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Home > Stocks                                           [Search Icon]   │
│                                                                           │
│  ┌─────────────────────────────┬───────────────────────────────────────┐ │
│  │ STOCKS                       │  🔥 TRENDING NOW                       │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                              │                                        │ │
│  │ [All] [Tech] [Energy]        │  ┌────────────────────────────────┐  │ │
│  │                              │  │ [Featured Image]               │  │ │
│  │ ┌──────────────────────────┐ │  │ AI Stocks Surging in 2026     │  │ │
│  │ │ [Large Featured Image]   │ │  │ Tech Stocks • 2 days ago       │  │ │
│  │ │                          │ │  └────────────────────────────────┘  │ │
│  │ │ Post Title Goes Here     │ │                                        │ │
│  │ │ Category • Date          │ │  ┌────────────────────────────────┐  │ │
│  │ └──────────────────────────┘ │  │ [Featured Image]               │  │ │
│  │                              │  │ Market Analysis Q4             │  │ │
│  │ ┌──────────────────────────┐ │  │ Stocks • 3 days ago            │  │ │
│  │ │ [Image]                  │ │  └────────────────────────────────┘  │ │
│  │ │ Another Post Title       │ │                                        │ │
│  │ │ Excerpt text...          │ │  ┌────────────────────────────────┐  │ │
│  │ └──────────────────────────┘ │  │ [Featured Image]               │  │ │
│  │                              │  │ Investment Tips 2026           │  │ │
│  │ ┌──────────────────────────┐ │  │ Guidance • 5 days ago          │  │ │
│  │ │ [Image]                  │ │  └────────────────────────────────┘  │ │
│  │ │ Third Post Title         │ │                                        │ │
│  │ │ Excerpt text...          │ │  ┌─────────────────────┐             │ │
│  │ └──────────────────────────┘ │  │  [View All Trending] │            │ │
│  │                              │  └─────────────────────┘             │ │
│  │ [Pagination: 1 2 3 Next]     │                                        │ │
│  │                              │                                        │ │
│  │  2/3 Width (66%)             │  1/3 Width (33%)                      │ │
│  └─────────────────────────────┴───────────────────────────────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────────────────────┐
│  [Mobile Navbar]                │
├─────────────────────────────────┤
│                                 │
│  Stocks                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  🔥 TRENDING NOW                │
│  ┌───────────────────────────┐ │
│  │ [Image] AI Stocks...      │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ [Image] Market Analysis.. │ │
│  └───────────────────────────┘ │
│                                 │
│  ALL POSTS                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ┌───────────────────────────┐ │
│  │ [Image] Post Title        │ │
│  │ Excerpt...                │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ [Image] Post Title        │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

---

## 🎯 Detailed Design Requirements

### 1. Main Content Area (2/3 Width)

#### Section Header
```
STOCKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- **Typography:** 
  - Font: Bold, 32px (desktop), 24px (mobile)
  - Color: Deep Blue (#1e3a8a) or Dark Gray (#1f2937)
  - Underline: 3px solid accent color (e.g., gold #fbbf24)
- **Animation:** Fade in on page load

#### Subcategory Filter Pills
```
[All] [Tech Stocks] [Energy Stocks] [Banking]
```
- **Design:**
  - Pills with rounded corners (border-radius: 20px)
  - Active: Solid background (blue/gold), white text
  - Inactive: Border only, gray text
  - Hover: Scale slightly (1.05), shadow
- **Spacing:** 8px gap between pills
- **Mobile:** Horizontal scroll if needed

#### Post Cards
**Large Featured Card (First Post):**
```
┌──────────────────────────────────────┐
│ [Large Image - 16:9 ratio, 600x400] │
│                                      │
│ Post Title in Large Font (24px)     │
│ Excerpt preview 2-3 lines...         │
│ Tech Stocks • Jan 17, 2026 • 5 min  │
└──────────────────────────────────────┘
```
- **Image:** High quality, with gradient overlay at bottom
- **Title:** Bold, truncate at 2 lines with ellipsis
- **Hover:** Image zooms slightly (scale: 1.05), shadow increases

**Standard Cards (Rest):**
```
┌────────────────────────────────────┐
│ [Image]        Post Title          │
│ 200x150        Excerpt preview     │
│                Category • Date      │
└────────────────────────────────────┘
```
- **Layout:** Image on left (30%), content on right (70%)
- **Image:** Cover fit, rounded corners
- **Hover:** Card lifts slightly (translateY: -4px), shadow

**Card Styles:**
```css
.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-4px);
}

.post-card img {
  transition: transform 0.3s ease;
}

.post-card:hover img {
  transform: scale(1.05);
}
```

---

### 2. Trending Sidebar (1/3 Width)

#### Section Header
```
🔥 TRENDING NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- **Icon:** Animated fire emoji or custom fire icon with gradient
- **Typography:** 
  - Font: Bold, 20px
  - Color: Orange-red gradient (#f97316 to #dc2626)
- **Animation:** Subtle pulse animation on fire icon

#### Trending Post Cards
**Compact Vertical Layout:**
```
┌──────────────────────────────┐
│ [Featured Image - 16:9]      │
│                              │
│ ★ Post Title (truncate 2)    │
│ Category • Time ago           │
└──────────────────────────────┘
```

**Visual Design:**
- **Image:** 
  - Full width, aspect ratio 16:9
  - Rounded corners (8px)
  - Subtle gradient overlay
- **Title:**
  - Font size: 16px, bold
  - Max 2 lines, ellipsis
  - Color: Dark blue (#1e3a8a)
- **Star Icon:** Small gold star (★) before title
- **Category Badge:** 
  - Small pill, accent color background
  - White text, 11px
- **Time:** Small gray text, "2 days ago" format

**Card Styles:**
```css
.trending-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e5e7eb;
}

.trending-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
}

.trending-card-image {
  position: relative;
  overflow: hidden;
}

.trending-card-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
}

.trending-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(251, 191, 36, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  backdrop-filter: blur(4px);
}
```

#### Sticky Behavior
```css
.trending-sidebar {
  position: sticky;
  top: 80px; /* Below fixed navbar */
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
}

/* Custom scrollbar */
.trending-sidebar::-webkit-scrollbar {
  width: 6px;
}

.trending-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
```

#### "View All Trending" Button
```
┌─────────────────────────────┐
│  →  View All Trending Posts │
└─────────────────────────────┘
```
- **Style:** 
  - Full width, rounded
  - Border style (not solid fill)
  - Gold/orange border color
  - Hover: Solid fill with white text
- **Animation:** Arrow bounces slightly on hover

---

### 3. Empty States

**No Trending Posts:**
```
┌──────────────────────────────┐
│      🔍                       │
│  No trending posts yet        │
│  Check back soon!             │
└──────────────────────────────┘
```
- Center aligned
- Light gray text
- Subtle icon

**No Posts in Category:**
```
┌──────────────────────────────┐
│      📭                       │
│  No posts in this category    │
│  yet. Check back later!       │
└──────────────────────────────┘
```

---

### 4. Loading States

**Skeleton Loaders:**
- Main content: 3-5 card skeletons
- Trending sidebar: 5 compact card skeletons
- Shimmer animation
- Match actual card dimensions

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Acceptance Criteria

### AC1: Layout Structure
- [ ] Desktop shows 2/3 + 1/3 layout
- [ ] Tablet shows 60% + 40% or stacks
- [ ] Mobile stacks (trending on top, then main content)
- [ ] Gap between columns (24-32px)
- [ ] Both columns aligned at top

### AC2: Main Content Area
- [ ] Category title displayed prominently
- [ ] Subcategory filter pills working
- [ ] First post is large featured card
- [ ] Remaining posts are standard cards
- [ ] Pagination functional
- [ ] Hover effects smooth
- [ ] Images load with lazy loading

### AC3: Trending Sidebar
- [ ] "TRENDING NOW" header with fire icon
- [ ] Fetches trending posts from API
- [ ] Shows top 5 trending posts (configurable)
- [ ] Posts displayed in compact cards
- [ ] Gold star icon before each title
- [ ] Time displayed as relative ("2 days ago")
- [ ] Category badge shown
- [ ] "View All Trending" button at bottom
- [ ] Sidebar is sticky (scrolls with page)
- [ ] Custom scrollbar if content overflows

### AC4: Visual Polish
- [ ] All animations smooth (60fps)
- [ ] Hover effects on all interactive elements
- [ ] Loading skeletons match actual layout
- [ ] Empty states friendly and clear
- [ ] Color scheme matches brand (financial aesthetic)
- [ ] Typography hierarchy clear
- [ ] Spacing consistent throughout

### AC5: Responsive Design
- [ ] Desktop (≥1024px): Side-by-side layout
- [ ] Tablet (768-1023px): Adjusted layout or stacked
- [ ] Mobile (<768px): Stacked, trending on top
- [ ] Images responsive and optimized
- [ ] Touch targets adequate on mobile (44x44px)
- [ ] No horizontal scroll on any device

### AC6: Performance
- [ ] Images lazy loaded
- [ ] Trending sidebar doesn't block main content
- [ ] Page loads in <2 seconds
- [ ] Smooth scroll performance
- [ ] No layout shift during load (CLS <0.1)

### AC7: Accessibility
- [ ] Semantic HTML (section, article, aside)
- [ ] Heading hierarchy correct (h1, h2, h3)
- [ ] Alt text on all images
- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] ARIA labels where needed
- [ ] Color contrast meets WCAG AA

### AC8: SEO
- [ ] Proper meta tags
- [ ] Structured data (JSON-LD)
- [ ] Open Graph tags
- [ ] Descriptive URLs

## Technical Notes

### Component Structure
```tsx
// src/app/category/[slug]/page.tsx
export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const page = parseInt(searchParams.page || '1');
  
  const [postsData, trendingPosts] = await Promise.all([
    fetchCategoryPosts(slug, page),
    fetchTrendingPosts()
  ]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs category={postsData.category} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <CategoryHeader category={postsData.category} />
          <SubcategoryFilters
            parentSlug={slug}
            subcategories={postsData.category.subcategories}
          />
          <PostList posts={postsData.posts} />
          <Pagination {...postsData} />
        </div>
        
        {/* Trending Sidebar - 1/3 width */}
        <aside className="lg:col-span-1">
          <TrendingSidebar trending={trendingPosts} />
        </aside>
      </div>
    </div>
  );
}
```

### Key Components to Create
```
src/components/
├── category/
│   ├── CategoryHeader.tsx
│   ├── SubcategoryFilters.tsx
│   ├── PostList.tsx
│   ├── PostCard.tsx
│   └── FeaturedPostCard.tsx
└── trending/
    ├── TrendingSidebar.tsx
    ├── TrendingCard.tsx
    ├── TrendingHeader.tsx
    └── EmptyTrendingState.tsx
```

### CSS/Tailwind Classes
```typescript
// Layout
const layoutClasses = "grid grid-cols-1 lg:grid-cols-3 gap-8";
const mainClasses = "lg:col-span-2";
const sidebarClasses = "lg:col-span-1 lg:sticky lg:top-20 lg:max-h-screen";

// Post Cards
const featuredCardClasses = "rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300";
const standardCardClasses = "flex gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-all";

// Trending Card
const trendingCardClasses = "bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-400 hover:translate-x-1 transition-all";
```

### API Integration
```typescript
// Fetch category posts
const fetchCategoryPosts = async (slug: string, page: number) => {
  const res = await fetch(
    `/api/posts?categorySlug=${slug}&page=${page}&limit=10`
  );
  return res.json();
};

// Fetch trending posts
const fetchTrendingPosts = async () => {
  const res = await fetch('/api/posts/trending?limit=5');
  return res.json();
};
```

### Performance Optimizations
```tsx
// Lazy load images
import Image from 'next/image';

<Image
  src={post.featuredImageUrl}
  alt={post.title}
  width={600}
  height={400}
  loading="lazy"
  className="object-cover"
/>

// Prefetch trending on hover
<Link
  href={`/post/${post._id}`}
  prefetch={true}
  onMouseEnter={() => prefetchPost(post._id)}
>
```

## Design Assets Needed
- [ ] Fire icon/emoji for trending header
- [ ] Star icon for trending cards
- [ ] Placeholder images for loading states
- [ ] Gradient overlays
- [ ] Color palette confirmation

## Dependencies
- BE-TREND-02 (Trending API) must be completed
- Image optimization library (Next.js Image)
- Date formatting library (date-fns or dayjs)
- Animation library (optional: framer-motion)

## Workflow
Designer → Create High-Fidelity Mockups → Get Approval → Developer → Build Layout → Build Components → Add Animations → Polish UI → Test on All Devices → Review

## Definition of Done
- [ ] Layout implemented (2/3 + 1/3)
- [ ] Main content area styled and functional
- [ ] Trending sidebar styled and functional
- [ ] All hover effects implemented
- [ ] All animations smooth
- [ ] Responsive on all devices
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Performance optimized
- [ ] Accessibility verified
- [ ] SEO metadata added
- [ ] Manual testing on multiple devices
- [ ] Design lead approval
- [ ] Code reviewed and merged

---

## 🎨 Final Polish Checklist

Before marking complete, verify:
- [ ] Every hover effect is smooth and intentional
- [ ] Color scheme is cohesive and professional
- [ ] Typography is readable and hierarchical
- [ ] Spacing is consistent throughout
- [ ] No visual bugs or glitches
- [ ] Looks great on iPhone, iPad, and Desktop
- [ ] Animations enhance (not distract from) UX
- [ ] **Overall feeling is: Professional, Modern, Attractive**
