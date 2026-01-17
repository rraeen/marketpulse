# Frontend Story - 3D Animated Background for Landing Page

## Story ID
FE-3D-01

## Story Title
As a frontend developer, I need to create an attractive 3D animated background with rotating financial symbols for the landing page.

## Priority
Medium

## Story Points
8

## ⚠️ IMPORTANT: Visual Impact & Performance
This feature is a **visual centerpiece** for the landing page. It MUST be:
- **Stunning:** Professionally designed, eye-catching 3D animation
- **Performant:** 60fps, no jank, doesn't slow down page
- **Subtle:** Background effect, doesn't distract from content
- **Responsive:** Works on all devices (optional on mobile for performance)

---

## 🎨 Visual Design Concept

### Option 1: Floating Dollar Signs (Recommended)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│         $                    MARKETPULSE                     │
│                         Financial Insights                   │
│              $                                               │
│    $                        [Get Started]                    │
│                                                         $    │
│                    $                                         │
│         $                                                    │
│                             $                                │
└──────────────────────────────────────────────────────────────┘
```
- **3-5 dollar signs** floating in the background
- **Slow rotation** on X, Y, Z axes
- **Gentle float** up and down
- **Semi-transparent** (#1e3a8a with 0.1-0.2 opacity)
- **Blur effect** for depth

---

### Option 2: Abstract Financial Particles
```
┌──────────────────────────────────────────────────────────────┐
│   · ·  ·                                                     │
│  ·   ·      ·         MARKETPULSE                      ·  ·  │
│    ·   ·   ·     Financial Insights      ·   ·    ·         │
│  ·     ·            [Get Started]          ·      ·          │
│     ·      ·   ·                      ·  ·    ·      ·       │
│  ·    ·              ·   ·        ·              ·    ·      │
└──────────────────────────────────────────────────────────────┘
```
- **Particle system** with financial symbols ($ € ¥ £ ₿)
- **Floating particles** moving slowly
- **Connecting lines** between nearby particles
- **Interactive:** React to mouse movement

---

### Option 3: Rotating 3D Coins/Tokens
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    ⭕                                                        │
│              ⭕          MARKETPULSE                    ⭕    │
│                    Financial Insights                        │
│         ⭕             [Get Started]               ⭕         │
│                                                              │
│              ⭕                              ⭕               │
└──────────────────────────────────────────────────────────────┘
```
- **3D coin/token models** rotating
- **Different sizes** for depth perception
- **Gold/silver metallic materials**
- **Reflection/refraction effects**

---

## 📋 Detailed Requirements

### 1. Technology Stack

#### Recommended: React Three Fiber (R3F)
**Why:**
- React-friendly, component-based
- Built on Three.js (industry standard)
- Good performance
- Large community

**Installation:**
```bash
npm install three @react-three/fiber @react-three/drei
```

**Alternative: Vanilla Three.js**
- More control, slightly more complex
- Better for custom animations

**Alternative: Spline**
- Visual design tool
- Export to React component
- Easier for designers, less control

---

### 2. Implementation Details

#### Basic Structure
```tsx
// src/app/page.tsx (Landing Page)
import { Canvas } from '@react-three/fiber'
import { FloatingDollarSigns } from '@/components/3d/FloatingDollarSigns'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* 3D Background Canvas */}
      <div className="fixed inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <FloatingDollarSigns />
        </Canvas>
      </div>
      
      {/* Main Content (on top) */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <CTA />
      </div>
    </div>
  )
}
```

---

### 3. Component Examples

#### Option 1: Floating Dollar Signs
```tsx
// src/components/3d/FloatingDollarSigns.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D, Float, Center } from '@react-three/drei'
import * as THREE from 'three'

export function FloatingDollarSigns() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Multiple dollar signs at different positions */}
      <DollarSign position={[-3, 2, -2]} scale={0.5} />
      <DollarSign position={[4, -1, -3]} scale={0.7} />
      <DollarSign position={[-2, -3, -1]} scale={0.6} />
      <DollarSign position={[3, 3, -4]} scale={0.8} />
      <DollarSign position={[0, -2, -2]} scale={0.5} />
    </>
  )
}

function DollarSign({ position, scale }) {
  const meshRef = useRef()
  
  // Continuous rotation animation
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2
    meshRef.current.rotation.y += delta * 0.3
    meshRef.current.rotation.z += delta * 0.1
  })
  
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.5, 0.5]}
    >
      <Center position={position} scale={scale}>
        <Text3D
          ref={meshRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={1}
          height={0.2}
          curveSegments={12}
        >
          $
          <meshStandardMaterial
            color="#1e3a8a"
            transparent
            opacity={0.15}
            roughness={0.3}
            metalness={0.8}
          />
        </Text3D>
      </Center>
    </Float>
  )
}
```

---

#### Option 2: Particle System
```tsx
// src/components/3d/FinancialParticles.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function FinancialParticles({ count = 100 }) {
  const points = useRef()
  
  // Generate random particle positions
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    
    return positions
  }, [count])
  
  // Animate particles
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Gentle wave motion
      points.current.geometry.attributes.position.array[i3 + 1] = 
        Math.sin(time + i) * 0.5
    }
    
    points.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#1e3a8a"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
```

---

#### Option 3: Rotating 3D Coins
```tsx
// src/components/3d/RotatingCoins.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, MeshTransmissionMaterial } from '@react-three/drei'

export function RotatingCoins() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      <Coin position={[-4, 2, -3]} scale={0.8} />
      <Coin position={[3, -1, -2]} scale={1.2} />
      <Coin position={[-2, -3, -1]} scale={0.6} />
      <Coin position={[4, 1, -4]} scale={1} />
    </>
  )
}

function Coin({ position, scale }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.8
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
  })
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, 0.2, 32]} />
      <meshStandardMaterial
        color="#fbbf24"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}
```

---

### 4. Performance Optimizations

#### A. Conditional Rendering (Mobile)
```tsx
'use client'
import { useEffect, useState } from 'react'

export function Background3D() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  // Don't render 3D on mobile for performance
  if (isMobile) {
    return <StaticGradientBackground />
  }
  
  return <Canvas>...</Canvas>
}
```

#### B. Reduce Quality on Low-End Devices
```tsx
import { useDetectGPU } from '@react-three/drei'

export function AdaptiveBackground() {
  const gpu = useDetectGPU()
  
  const particleCount = gpu.tier >= 2 ? 100 : 50
  const shadows = gpu.tier >= 2
  
  return (
    <Canvas shadows={shadows}>
      <FinancialParticles count={particleCount} />
    </Canvas>
  )
}
```

#### C. Lazy Loading
```tsx
import dynamic from 'next/dynamic'

const Background3D = dynamic(
  () => import('@/components/3d/Background3D'),
  { ssr: false, loading: () => <div className="bg-gradient" /> }
)
```

---

### 5. Styling & Integration

#### CSS for Canvas Container
```css
.canvas-container {
  position: fixed;
  inset: 0;
  z-index: -10;
  pointer-events: none; /* Don't block clicks */
}

/* Gradient fallback */
.gradient-fallback {
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #3b82f6 50%,
    #60a5fa 100%
  );
  opacity: 0.1;
}
```

#### Blur Effect for Depth
```tsx
<div className="fixed inset-0 -z-10">
  <Canvas>
    <FloatingDollarSigns />
  </Canvas>
  
  {/* Optional blur overlay */}
  <div className="absolute inset-0 backdrop-blur-sm" />
</div>
```

---

### 6. Interactive Features (Optional)

#### Mouse Parallax
```tsx
import { useThree } from '@react-three/fiber'

function MouseParallax() {
  const { camera } = useThree()
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      
      camera.position.x = x * 0.5
      camera.position.y = y * 0.5
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [camera])
  
  return null
}
```

---

## Acceptance Criteria

### AC1: Visual Quality
- [ ] 3D animation renders correctly
- [ ] Objects rotate/float smoothly
- [ ] Depth perception clear (foreground/background)
- [ ] Colors match brand (deep blue, gold accents)
- [ ] Semi-transparent, doesn't overpower content

### AC2: Performance
- [ ] Maintains 60fps on desktop
- [ ] No janky scrolling or interactions
- [ ] Page load time <3 seconds
- [ ] Doesn't block main thread
- [ ] Lazy loaded (doesn't delay initial content)

### AC3: Responsive Behavior
- [ ] Works on desktop (1920x1080 and up)
- [ ] Scales appropriately on laptop (1366x768)
- [ ] Optional or simplified on tablet
- [ ] Disabled or gradient fallback on mobile
- [ ] No horizontal scroll issues

### AC4: Integration
- [ ] Content remains readable on top of animation
- [ ] Doesn't interfere with clicks/interactions
- [ ] Fixed position (scrolls with page)
- [ ] Z-index correct (behind content)

### AC5: Accessibility
- [ ] Respects `prefers-reduced-motion`
- [ ] Provides static fallback if needed
- [ ] Doesn't cause motion sickness (subtle animations)
- [ ] Doesn't flash or strobe

### AC6: Browser Support
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Graceful degradation in older browsers
- [ ] WebGL detection with fallback

---

## Technical Notes

### Files to Create
```
src/components/3d/
├── Background3D.tsx              # Main wrapper
├── FloatingDollarSigns.tsx       # Option 1
├── FinancialParticles.tsx        # Option 2
├── RotatingCoins.tsx             # Option 3
└── StaticGradientFallback.tsx    # Fallback
```

### Files to Modify
- `src/app/page.tsx` - Add 3D background

### Assets Needed
- 3D fonts (if using Text3D): `/public/fonts/helvetiker_bold.typeface.json`
- 3D models (if using custom models): `/public/models/coin.glb`

### Dependencies
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0"
  }
}
```

### Bundle Size Impact
- Three.js: ~600KB (gzipped: ~150KB)
- React Three Fiber: ~50KB (gzipped: ~15KB)
- **Total:** ~650KB (~165KB gzipped)

**Mitigation:** Lazy load to not block initial render

---

## Design Recommendations

### Color Palette
- **Primary Color:** #1e3a8a (Deep Blue) - 15% opacity
- **Accent Color:** #fbbf24 (Gold) - 20% opacity
- **Gradient:** Blue to lighter blue
- **Glow:** Subtle gold glow on hover (optional)

### Animation Speed
- **Rotation:** 0.2-0.3 rad/s (slow)
- **Float:** 1-2 second cycle
- **Particles:** 0.1-0.2 speed
- **General:** Subtle, not distracting

### Camera Settings
```tsx
<Canvas
  camera={{
    position: [0, 0, 5],
    fov: 50,
    near: 0.1,
    far: 100
  }}
>
```

---

## Testing Checklist

### Visual Testing
- [ ] Animations smooth at 60fps
- [ ] No visual glitches or z-fighting
- [ ] Proper depth sorting
- [ ] Colors match design
- [ ] Opacity appropriate

### Performance Testing
- [ ] Check FPS counter (60fps target)
- [ ] Profile in Chrome DevTools
- [ ] Test on mid-range laptop
- [ ] Test on mobile (should fallback)
- [ ] Memory usage stable (no leaks)

### Device Testing
- [ ] Desktop Chrome/Firefox/Safari/Edge
- [ ] MacBook Pro/Air
- [ ] iPad Pro/Air
- [ ] iPhone (should show fallback)
- [ ] Android (should show fallback)

### Accessibility Testing
- [ ] Reduced motion respected
- [ ] No seizure-inducing effects
- [ ] Content still readable
- [ ] Screen reader not affected

---

## Fallback Strategy

### Progressive Enhancement
```tsx
// Level 1: Full 3D (High-end desktop)
<Canvas><FloatingDollarSigns /></Canvas>

// Level 2: Simplified 3D (Mid-range)
<Canvas><FinancialParticles count={50} /></Canvas>

// Level 3: CSS Animation (Low-end/mobile)
<div className="animated-gradient" />

// Level 4: Static Gradient (No animation)
<div className="static-gradient" />
```

### Prefers Reduced Motion
```tsx
const prefersReducedMotion = useMediaQuery(
  '(prefers-reduced-motion: reduce)'
)

if (prefersReducedMotion) {
  return <StaticGradientFallback />
}
```

---

## Alternative: CSS-Only Solution (Lightweight)

If Three.js is too heavy, use CSS:

```css
.landing-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

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

.floating-symbol:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.floating-symbol:nth-child(2) { top: 60%; left: 80%; animation-delay: 1s; }
.floating-symbol:nth-child(3) { top: 80%; left: 20%; animation-delay: 2s; }
```

---

## Implementation Steps

1. **Setup:** Install dependencies
2. **Prototype:** Build basic 3D scene
3. **Design:** Choose and refine visual style
4. **Optimize:** Add performance optimizations
5. **Fallback:** Implement mobile/low-end fallback
6. **Polish:** Fine-tune animations and colors
7. **Test:** Performance and device testing

---

## Dependencies
None (new feature)

## Estimated Time
- Basic setup: 1 day
- Visual design & refinement: 2-3 days
- Performance optimization: 1-2 days
- Testing & polish: 1 day
- **Total:** 5-7 days

## Definition of Done
- [ ] 3D background implemented and rendering
- [ ] Animations smooth (60fps)
- [ ] Performance optimized
- [ ] Mobile fallback working
- [ ] Reduced motion respected
- [ ] Content remains readable
- [ ] All browsers tested
- [ ] No performance regressions
- [ ] Design approved
- [ ] Code reviewed and merged
