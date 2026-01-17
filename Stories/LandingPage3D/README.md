# 3D Animated Landing Page Background

## Overview
Add an attractive 3D animated background to the landing page featuring rotating/floating financial symbols (dollar signs, coins, particles) to create a modern, engaging, and professional first impression.

## Visual Concept Options

### 1. 🌟 Floating Dollar Signs (Recommended)
- 3-5 large, semi-transparent dollar signs
- Slow 3D rotation on all axes
- Gentle floating motion
- Professional and clean

### 2. ✨ Particle System
- 100+ small particles with financial symbols
- Floating and connecting with lines
- Interactive mouse parallax
- Modern tech aesthetic

### 3. 💰 3D Coins/Tokens
- Multiple rotating coins
- Metallic gold/silver materials
- Depth-based sizing
- Luxurious feel

## Technology Stack

**Primary:** React Three Fiber (R3F)
- React-friendly
- Built on Three.js
- Component-based
- Good performance

**Bundle Size:** ~165KB gzipped (lazy loaded)

## Key Features

✨ **Visual Appeal**
- Professional 3D graphics
- Smooth 60fps animations
- Brand colors (deep blue, gold)
- Semi-transparent overlays

⚡ **Performance**
- 60fps on desktop
- Lazy loaded (doesn't block page load)
- Adaptive quality based on device
- Mobile fallback (CSS gradient)

📱 **Responsive**
- Full effect on desktop
- Simplified on tablet
- Static gradient on mobile
- Respects reduced motion preference

## Implementation Summary

### Install Dependencies
```bash
npm install three @react-three/fiber @react-three/drei
```

### Basic Structure
```tsx
// src/app/page.tsx
<div className="relative min-h-screen">
  {/* 3D Background (behind everything) */}
  <div className="fixed inset-0 -z-10">
    <Canvas>
      <FloatingDollarSigns />
    </Canvas>
  </div>
  
  {/* Content (on top) */}
  <div className="relative z-10">
    <Hero />
    <Features />
  </div>
</div>
```

### Performance Optimizations
1. **Lazy load:** Don't block initial render
2. **Conditional render:** Skip on mobile
3. **Adaptive quality:** Reduce particles on low-end devices
4. **Reduced motion:** Static fallback if user prefers

## Files Structure

```
src/components/3d/
├── Background3D.tsx                 # Main wrapper
├── FloatingDollarSigns.tsx          # Option 1 implementation
├── FinancialParticles.tsx           # Option 2 implementation
├── RotatingCoins.tsx                # Option 3 implementation
└── StaticGradientFallback.tsx       # Fallback for mobile/low-end
```

## Design Specifications

### Colors
- Primary: #1e3a8a (15% opacity)
- Accent: #fbbf24 (20% opacity)
- Transparent background

### Animation Speed
- Rotation: 0.2-0.3 rad/s
- Float cycle: 1-2 seconds
- Subtle, not distracting

### Camera Settings
- Position: [0, 0, 5]
- FOV: 50
- Background: transparent

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)
✅ WebGL-capable browsers
⚠️ Graceful fallback for older browsers
❌ IE11 (shows gradient fallback)

## Performance Targets

- **FPS:** 60fps on desktop
- **Load Time:** <3s (with lazy loading)
- **Bundle:** ~165KB gzipped
- **Memory:** Stable, no leaks

## Fallback Strategy

```
High-End Desktop    → Full 3D with all effects
Mid-Range Desktop   → Simplified 3D (fewer particles)
Tablet              → Minimal 3D or CSS animation
Mobile              → Static/animated CSS gradient
Reduced Motion Pref → Static gradient
```

## Testing Checklist

- [ ] Smooth 60fps animations
- [ ] Works on Chrome/Firefox/Safari/Edge
- [ ] Mobile shows fallback
- [ ] Reduced motion respected
- [ ] No performance regression
- [ ] Content readable on top
- [ ] No click-blocking
- [ ] Lazy loaded successfully

## Estimated Timeline

- Setup & prototype: 1 day
- Visual design: 2-3 days
- Optimization: 1-2 days
- Testing & polish: 1 day
- **Total: 5-7 days**

## Quick Start for Developers

1. Install dependencies
```bash
npm install three @react-three/fiber @react-three/drei
```

2. Create basic 3D component
```tsx
// src/components/3d/FloatingDollarSigns.tsx
import { Canvas } from '@react-three/fiber'
import { Float, Text3D } from '@react-three/drei'

export function FloatingDollarSigns() {
  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      
      <Float>
        <Text3D font="/fonts/font.json">
          $
          <meshStandardMaterial
            color="#1e3a8a"
            transparent
            opacity={0.15}
          />
        </Text3D>
      </Float>
    </>
  )
}
```

3. Add to landing page
```tsx
// src/app/page.tsx
import dynamic from 'next/dynamic'

const Background3D = dynamic(
  () => import('@/components/3d/Background3D'),
  { ssr: false }
)

export default function LandingPage() {
  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10">
        <Background3D />
      </div>
      {/* Your content */}
    </div>
  )
}
```

## Alternative: Lightweight CSS Solution

If bundle size is a concern, use CSS-only:

```css
.floating-symbol {
  position: absolute;
  font-size: 8rem;
  color: rgba(30, 58, 138, 0.1);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}
```

**Pros:** No JS, tiny size, good performance  
**Cons:** Less impressive, limited effects

## Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Examples](https://threejs.org/examples/)
- [R3F Drei Helpers](https://github.com/pmndrs/drei)
- [Spline Design Tool](https://spline.design/)

## Questions?

- Story Details: `Stories/LandingPage3D/Frontend/01_3d_animated_background.md`
- Design Lead: For visual approval
- Performance: Ensure <3s page load maintained
