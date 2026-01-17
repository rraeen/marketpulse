# Frontend Story 01 - Admin Trending Toggle UI

## Story ID
FE-TREND-01

## Story Title
As a frontend developer, I need to create an attractive admin UI for toggling the trending status of posts.

## Priority
High

## Story Points
5

## Description
Build an intuitive, visually appealing interface in the admin post management area that allows admins to easily mark/unmark posts as trending with a single click. The UI should provide immediate visual feedback and be mobile-friendly.

## 🎨 UI/UX Requirements

### Design Philosophy
- **Simple & Intuitive:** One-click toggle with clear visual state
- **Professional:** Matches the financial industry aesthetic
- **Responsive:** Visual feedback on interaction
- **Accessible:** Clear indicators, keyboard navigable

---

## Visual Design Specifications

### Trending Icon/Button Design

#### Option 1: Star Icon (Recommended)
```
┌─────────────────────────────────────────────────────────┐
│  Post Title: AI Stocks Surging...     [✓ Published]    │
│  Category: Tech Stocks • Jan 15, 2026                   │
│                                                          │
│  Actions:                                                │
│  [Edit] [Delete] [★ Mark as Trending]  ← Not trending  │
│                                                          │
│  Post Title: Market Analysis Q4...    [□ Draft]         │
│  Category: Stocks • Jan 14, 2026                        │
│                                                          │
│  Actions:                                                │
│  [Edit] [Delete] [★ Trending] ← Currently trending     │
└─────────────────────────────────────────────────────────┘
```

**States:**
- **Not Trending:** ☆ (outline star) + gray color + "Mark as Trending" text
- **Trending:** ★ (filled star) + gold/yellow color + "Trending" text
- **Hover:** Scale slightly larger + tooltip
- **Active/Click:** Brief animation (pulse or sparkle effect)

---

#### Option 2: Fire/Flame Icon
```
Not Trending: 🔥 (gray outline)
Trending:     🔥 (orange/red gradient)
```

---

#### Option 3: Eye/View Icon
```
Not Trending: 👁️ (gray outline)
Trending:     👁️ (blue gradient with glow)
```

---

### Placement Options

#### Location 1: Post List Table (Recommended)
```
┌──────────────────────────────────────────────────────────────────────┐
│ Title            | Category  | Status    | Trending  | Actions      │
├──────────────────────────────────────────────────────────────────────┤
│ AI Stocks        │ Stocks    │ Published │    ☆      │ [Edit][Del]  │
│ Market Analysis  │ Commodities│ Published │    ★      │ [Edit][Del]  │
│ Q4 Outlook       │ Real Estate│ Draft     │    ☆      │ [Edit][Del]  │
└──────────────────────────────────────────────────────────────────────┘
```

---

#### Location 2: Post Editor Page
Add trending toggle in the post metadata section:
```
┌────────────────────────────────────────┐
│ Post Settings                          │
├────────────────────────────────────────┤
│ Category: [Stocks ▼]                   │
│ Status:   [Published ▼]                │
│                                        │
│ □ Mark as Trending                     │
│   ★ This post will appear in the      │
│      trending sidebar                  │
└────────────────────────────────────────┘
```

---

## Detailed Requirements

### 1. Post List Table Column

**Add "Trending" Column:**
- Position: Between "Status" and "Actions"
- Width: 80-100px
- Centered icon button
- Click toggles trending status

**Visual States:**
```css
/* Not Trending */
.trending-icon.inactive {
  color: #9ca3af;  /* gray-400 */
  opacity: 0.6;
}

/* Trending */
.trending-icon.active {
  color: #fbbf24;  /* gold/yellow */
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
  animation: pulse 2s infinite;
}

/* Hover */
.trending-icon:hover {
  transform: scale(1.15);
  cursor: pointer;
  opacity: 1;
}

/* Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

### 2. Post Editor Checkbox

**Add Trending Toggle:**
- Position: In post settings sidebar or below category/status
- Checkbox + label with icon
- Helper text explaining what trending means
- Show toggle for both new and existing posts

**Visual Design:**
```
┌────────────────────────────────────────┐
│ [★] Mark as Trending                   │
│     ────────────────────────────────   │
│     This post will be featured in the  │
│     trending sidebar on category pages │
└────────────────────────────────────────┘
```

---

### 3. Loading & Success States

**Loading State (During API Call):**
```
[⟳ Updating...] ← Spinner icon
```

**Success State:**
```
Brief flash animation + icon change
Optional: Toast notification
  ✓ "Post marked as trending!"
  ✓ "Post removed from trending"
```

**Error State:**
```
Icon reverts to previous state
Toast notification:
  ✗ "Failed to update trending status. Please try again."
```

---

### 4. Mobile Responsive

**Mobile Post List:**
- Trending icon smaller but still visible
- Touch-friendly size (min 44x44px)
- Long-press for confirmation (optional)

**Mobile Editor:**
- Full-width toggle switch instead of checkbox
- Clear label and description

---

## Acceptance Criteria

### AC1: Post List Table
- [ ] Trending column added to post list table
- [ ] Star icon (or chosen icon) displayed for each post
- [ ] Icon shows correct state (active/inactive)
- [ ] Click toggles trending status via API
- [ ] Visual feedback on hover
- [ ] Loading state shown during API call
- [ ] Success animation on toggle

### AC2: Post Editor
- [ ] Trending toggle added to editor
- [ ] Checkbox/switch shows current trending status
- [ ] Toggle updates on save
- [ ] Helper text explains feature
- [ ] Works for both new and existing posts

### AC3: API Integration
- [ ] Calls PATCH /api/admin/posts/:id/trending
- [ ] Optimistic UI update
- [ ] Rolls back on error
- [ ] Error handling with user-friendly message

### AC4: Visual Polish
- [ ] Smooth animations (no jank)
- [ ] Clear visual distinction between states
- [ ] Icon looks professional and attractive
- [ ] Colors match site theme
- [ ] Tooltip on hover (optional but recommended)

### AC5: Accessibility
- [ ] Icon button has aria-label
- [ ] Keyboard accessible (Tab + Enter/Space)
- [ ] Screen reader announces state change
- [ ] Focus visible indicator

### AC6: Mobile Responsive
- [ ] Icon visible and clickable on mobile
- [ ] Touch target size adequate (44x44px min)
- [ ] No layout breaks on small screens

## Technical Notes

### Component Structure
```tsx
// src/components/admin/TrendingToggle.tsx
interface TrendingToggleProps {
  postId: string;
  isTrending: boolean;
  onToggle?: (postId: string, newValue: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TrendingToggle({
  postId,
  isTrending,
  onToggle,
  size = 'md',
  showLabel = false
}: TrendingToggleProps) {
  const [loading, setLoading] = useState(false);
  const [currentState, setCurrentState] = useState(isTrending);

  const handleToggle = async () => {
    setLoading(true);
    
    // Optimistic update
    setCurrentState(!currentState);
    
    try {
      const response = await fetch(
        `/api/admin/posts/${postId}/trending`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isTrending: !currentState })
        }
      );
      
      if (!response.ok) throw new Error('Failed to update');
      
      onToggle?.(postId, !currentState);
      toast.success(
        !currentState ? 'Marked as trending!' : 'Removed from trending'
      );
    } catch (error) {
      // Rollback on error
      setCurrentState(currentState);
      toast.error('Failed to update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'trending-icon',
        currentState ? 'active' : 'inactive',
        sizeClasses[size]
      )}
      aria-label={
        currentState ? 'Remove from trending' : 'Mark as trending'
      }
      title={currentState ? 'Trending' : 'Mark as Trending'}
    >
      {loading ? (
        <LoadingSpinner />
      ) : currentState ? (
        <StarFilled className="text-yellow-400" />
      ) : (
        <StarOutline className="text-gray-400" />
      )}
      {showLabel && (
        <span className="ml-2">
          {currentState ? 'Trending' : 'Mark as Trending'}
        </span>
      )}
    </button>
  );
}
```

### Files to Create
1. `src/components/admin/TrendingToggle.tsx` - Toggle component
2. `src/components/admin/TrendingToggle.module.css` - Styles (if not using Tailwind)

### Files to Modify
1. `src/app/admin/posts/page.tsx` - Add trending column to table
2. `src/app/admin/posts/[id]/page.tsx` - Add trending toggle to editor

### State Management
```typescript
// In post list
const [posts, setPosts] = useState<Post[]>([]);

const handleTrendingToggle = (postId: string, isTrending: boolean) => {
  setPosts(prev =>
    prev.map(post =>
      post._id === postId ? { ...post, isTrending } : post
    )
  );
};
```

### Icon Library Options
- **Lucide React:** `<Star />`, `<StarOff />`
- **Heroicons:** `StarIcon`
- **React Icons:** `AiFillStar`, `AiOutlineStar`
- **Custom SVG:** Design custom icon

## Design References

**Inspiration:**
- Medium's "Featured" badge
- Twitter's bookmark icon toggle
- YouTube's star rating
- Product Hunt's upvote animation

**Color Palette:**
- Inactive: Gray (#9ca3af)
- Active: Gold (#fbbf24)
- Hover: Brighter gold (#fcd34d)
- Background glow: rgba(251, 191, 36, 0.2)

## Dependencies
- BE-TREND-02 (Trending API) must be completed
- Toast notification library (e.g., react-hot-toast, sonner)

## Workflow
Designer → Create Mockup → Developer → BuildComponent → IntegrateAPI → Polish Animations → Test → Review

## Definition of Done
- [ ] Trending toggle component built
- [ ] Added to post list table
- [ ] Added to post editor
- [ ] API integration working
- [ ] Optimistic updates implemented
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Animations smooth and attractive
- [ ] Accessible (keyboard, screen reader)
- [ ] Responsive on mobile
- [ ] Manual testing completed
- [ ] Code reviewed and merged
- [ ] UI/UX approved by design lead
