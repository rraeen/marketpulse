"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
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
  const { theme, resolvedTheme } = useTheme();
  const [shouldRender3D, setShouldRender3D] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme changes - disable 3D in light mode
  useEffect(() => {
    const currentTheme = resolvedTheme || theme;
    if (currentTheme === "light") {
      // Disable 3D immediately when switching to light mode
      setShouldRender3D(false);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
      return;
    }
    
    // Only proceed with 3D setup in dark mode
    if (currentTheme !== "dark") {
      return; // Wait for theme to resolve
    }
    
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
      
      // Only enable 3D on desktop, with WebGL, no reduced motion, and in dark mode
      if (!isMobile && webGLSupported && !prefersReducedMotion) {
        // Wait for idle period (2 seconds) before enabling 3D
        idleTimeoutRef.current = setTimeout(() => {
          setShouldRender3D(true);
        }, 2000);
      }
    };
    
    check3DSupport();
    
    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };
  }, [theme, resolvedTheme]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <StaticGradient />;
  }

  // Always show static gradient in light mode
  const currentTheme = resolvedTheme || theme;
  if (currentTheme === "light") {
    return <StaticGradient />;
  }

  // Default to static gradient - 3D only enabled after idle on desktop in dark mode
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
