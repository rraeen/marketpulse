# Trending Posts - Quick Reference Guide

## For Backend Developers

### Data Model Addition
```typescript
interface Post {
  // ... existing fields
  isTrending: boolean;  // NEW: defaults to false
  // ... rest of fields
}
```

### API Endpoints

```
# Toggle trending status (Admin only)
PATCH /api/admin/posts/:id/trending
Body: { "isTrending": true }

# Get trending posts (Public)
GET /api/posts/trending?limit=5&categoryId=...

# Existing endpoints now include isTrending
GET /api/posts
PATCH /api/admin/posts/:id
```

### Database Index
```typescript
// Add to src/lib/db.ts
await db.collection('posts').createIndex({
  isTrending: 1,
  status: 1,
  createdAt: -1
});
```

### Service Functions
```typescript
// Toggle trending
export async function toggleTrending(
  postId: string,
  isTrending: boolean
): Promise<Post | null>

// Get trending posts
export async function getTrendingPosts(
  limit: number = 5,
  categoryId?: string
): Promise<Post[]>
```

---

## For Frontend Developers

### Component Locations

#### Admin UI
```tsx
<TrendingToggle
  postId="..."
  isTrending={false}
  onToggle={(id, value) => {}}
  size="md"
  showLabel={false}
/>
```

#### Public Category Page
```tsx
// Layout structure
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Main content - 2/3 width */}
    <PostList posts={posts} />
  </div>
  
  <aside className="lg:col-span-1">
    {/* Trending sidebar - 1/3 width */}
    <TrendingSidebar trending={trendingPosts} />
  </aside>
</div>
```

### Key Components

```
src/components/
├── admin/
│   └── TrendingToggle.tsx         # Toggle icon/button
├── category/
│   ├── PostCard.tsx               # Main post card
│   └── FeaturedPostCard.tsx       # First post (large)
└── trending/
    ├── TrendingSidebar.tsx        # Sidebar container
    ├── TrendingCard.tsx           # Compact trending card
    └── TrendingHeader.tsx         # "TRENDING NOW" header
```

### Styling (Tailwind)

```tsx
// Layout
const layout = "grid grid-cols-1 lg:grid-cols-3 gap-8";
const mainContent = "lg:col-span-2";
const sidebar = "lg:col-span-1 sticky top-20";

// Trending card hover effect
const trendingCard = `
  bg-white rounded-lg border border-gray-200
  hover:border-yellow-400 hover:translate-x-1
  transition-all duration-200
`;

// Star icon states
const starInactive = "text-gray-400 opacity-60";
const starActive = "text-yellow-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]";
```

### API Integration

```typescript
// Fetch trending posts
const fetchTrending = async () => {
  const res = await fetch('/api/posts/trending?limit=5');
  const { trending } = await res.json();
  return trending;
};

// Toggle trending status
const toggleTrending = async (postId: string, isTrending: boolean) => {
  const res = await fetch(`/api/admin/posts/${postId}/trending`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isTrending })
  });
  return res.json();
};
```

---

## UI/UX Specifications

### Design Tokens

```css
/* Colors */
--color-primary: #1e3a8a;      /* Deep Blue */
--color-accent: #fbbf24;        /* Gold */
--color-trending: #f97316;      /* Orange */
--color-bg: #f9fafb;            /* Light Gray */

/* Typography */
--font-title: 24-32px, bold;
--font-post-title: 18-20px, bold;
--font-trending-title: 16px, bold;
--font-body: 14-16px;

/* Spacing */
--gap-section: 32-48px;
--gap-card: 16-24px;
--padding-card: 16-24px;

/* Animation */
--duration: 200-300ms;
--easing: ease-in-out;
```

### Hover Effects

```css
/* Post Card */
.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.post-card:hover img {
  transform: scale(1.05);
}

/* Trending Card */
.trending-card:hover {
  transform: translateX(4px);
  border-color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

/* Star Icon */
.trending-icon:hover {
  transform: scale(1.15);
}

.trending-icon.active {
  animation: pulse 2s infinite;
}
```

### Responsive Layout

```
Desktop (≥1024px):
┌───────────────────────────┐
│ Main (2/3) │ Sidebar (1/3)│
└───────────────────────────┘

Tablet (768-1023px):
┌───────────────────────────┐
│ Main (60%) │ Sidebar (40%)│
└───────────────────────────┘

Mobile (<768px):
┌────────────┐
│  Trending  │ ← On top
├────────────┤
│    Main    │
└────────────┘
```

---

## Testing Scenarios

### Happy Path
1. Admin marks post as trending
2. Post appears in trending sidebar
3. Public user sees post in sidebar
4. Clicking post navigates to detail page

### Edge Cases
1. No trending posts → Show empty state
2. >5 trending posts → Show top 5 by date
3. All trending posts in one category → Still show all
4. Mobile view → Trending on top, scrolls independently

### Error Cases
1. API fails to toggle → Rollback UI, show toast error
2. API fails to fetch trending → Show empty state
3. Image fails to load → Show placeholder

---

## Performance Tips

### Optimizations
```tsx
// Lazy load images
<Image
  src={post.featuredImageUrl}
  alt={post.title}
  width={600}
  height={400}
  loading="lazy"
/>

// Prefetch on hover
<Link
  href={`/post/${post._id}`}
  prefetch={true}
  onMouseEnter={() => router.prefetch(`/post/${post._id}`)}
>

// Memoize expensive computations
const sortedTrending = useMemo(
  () => trending.sort((a, b) => b.createdAt - a.createdAt),
  [trending]
);
```

---

## Common Issues & Solutions

### Issue: Trending icon not updating after click
**Solution:** Check optimistic update logic, ensure state is managed correctly

### Issue: Sidebar not sticky on scroll
**Solution:** Verify `position: sticky` and `top` value set correctly

### Issue: Layout breaks on tablet
**Solution:** Test at 768-1024px, adjust grid breakpoints

### Issue: Images not loading in trending cards
**Solution:** Check image paths, ensure Next.js Image configured

### Issue: Hover effects laggy
**Solution:** Use `will-change: transform` and ensure GPU acceleration

---

## Accessibility Checklist

- [ ] Star icon has `aria-label` ("Mark as trending" / "Remove from trending")
- [ ] Keyboard accessible (Tab, Enter, Space)
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces state changes
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Semantic HTML (`<aside>`, `<article>`, etc.)
- [ ] Heading hierarchy correct (h1, h2, h3)
- [ ] Alt text on all images

---

## Deployment Checklist

### Backend
- [ ] Migration script run successfully
- [ ] Index created on posts collection
- [ ] API endpoints tested
- [ ] Authorization working
- [ ] Error handling tested

### Frontend
- [ ] Admin toggle working
- [ ] Trending sidebar rendering
- [ ] Layout responsive on all devices
- [ ] All animations smooth
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Images optimized
- [ ] SEO metadata added

### Integration
- [ ] End-to-end flow tested
- [ ] Performance targets met (<2s load)
- [ ] Accessibility verified
- [ ] Cross-browser tested
- [ ] Mobile tested on real devices

---

## Quick Commands

```bash
# Run migration
npm run migrate:trending

# Test trending API
curl http://localhost:3000/api/posts/trending?limit=5

# Toggle trending (requires auth)
curl -X PATCH http://localhost:3000/api/admin/posts/:id/trending \
  -H "Content-Type: application/json" \
  -d '{"isTrending": true}'

# Run tests
npm test -- trending
npm run test:e2e -- trending

# Build and check bundle
npm run build
npm run analyze
```

---

## Need Help?

- **Backend Questions:** Check `Stories/TrendingFeature/Backend/`
- **Frontend Questions:** Check `Stories/TrendingFeature/Frontend/`
- **Full Documentation:** Check `Stories/TrendingFeature/README.md`
- **Design Questions:** Consult design lead
- **Issues:** Create ticket with label `trending-feature`

---

## Resources

- **Icons:** Lucide React (`Star`, `StarOff`, `Flame`)
- **Animation:** Framer Motion (optional)
- **Date:** date-fns (`formatDistanceToNow`)
- **Toast:** react-hot-toast or sonner
- **Images:** Next.js Image component
