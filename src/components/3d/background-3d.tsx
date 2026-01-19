"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { RotatingDowel } from "./rotating-dowel";

/**
 * Static gradient fallback - default background
 * This is what users see by default for better performance
 */
function StaticGradient() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20" />
  );
}

/**
 * Background3D Component
 * 
 * Defaults to static gradient for performance.
 * Only enables 3D WebGL rendering on:
 * - Desktop devices (non-mobile)
 * - After 2 seconds of idle time
 * - When WebGL is supported
 * - When user hasn't requested reduced motion
 */
export function Background3D() {
  const [shouldRender3D, setShouldRender3D] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if 3D should be enabled
    const check3DSupport = () => {
      // Check WebGL support
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      const webGLSupported = !!gl;
      
      // Check for reduced motion preference
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const prefersReducedMotion = mediaQuery.matches;
      
      // Check if mobile (desktop only)
      const isMobile = window.innerWidth < 768;
      
      // Only enable 3D on desktop, with WebGL, and no reduced motion preference
      if (!isMobile && webGLSupported && !prefersReducedMotion) {
        // Wait for idle period (2 seconds) before enabling 3D
        idleTimeoutRef.current = setTimeout(() => {
          setShouldRender3D(true);
        }, 2000);
      }
      
      return () => {
        if (idleTimeoutRef.current) {
          clearTimeout(idleTimeoutRef.current);
        }
      };
    };
    
    const cleanup = check3DSupport();
    
    return () => {
      cleanup();
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <StaticGradient />;
  }

  // Default to static gradient - 3D only enabled after idle on desktop
  if (!shouldRender3D) {
    return <StaticGradient />;
  }

  return (
    <div 
      className="fixed inset-0 -z-10 pointer-events-none" 
      style={{ 
        width: "100vw", 
        height: "100vh",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Canvas
        camera={{
          position: [0, 2, 18],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ 
          background: "transparent",
          width: "100%", 
          height: "100%",
          display: "block",
        }}
      >
        <Suspense fallback={null}>
          <RotatingDowel />
        </Suspense>
      </Canvas>
    </div>
  );
}
