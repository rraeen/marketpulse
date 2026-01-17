"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RotatingDowel } from "./rotating-dowel";

function LoadingFallback() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20" />
  );
}

export function Background3D() {
  const [isMobile, setIsMobile] = useState(true); // Start as true to prevent hydration issues
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check WebGL support
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    setWebGLSupported(!!gl);
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Debug logging effect - must be before any conditional returns
  useEffect(() => {
    if (mounted) {
      if (prefersReducedMotion || !webGLSupported) {
        console.log("3D disabled:", { prefersReducedMotion, webGLSupported, isMobile });
      } else {
        console.log("Background3D rendering:", { isMobile, prefersReducedMotion, webGLSupported, mounted });
      }
    }
  }, [isMobile, prefersReducedMotion, webGLSupported, mounted]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <LoadingFallback />;
  }

  // Temporarily allow rendering to debug - only block if WebGL is not supported or reduced motion
  // TODO: Re-enable mobile check after debugging
  if (prefersReducedMotion || !webGLSupported) {
    return <LoadingFallback />;
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
          background: "rgba(0, 0, 0, 0.01)", // Slightly visible for debugging
          width: "100%", 
          height: "100%",
          display: "block",
        }}
        onCreated={(state) => {
          console.log("Canvas created:", state);
          console.log("Camera position:", state.camera.position);
        }}
      >
        <Suspense fallback={null}>
          <RotatingDowel />
        </Suspense>
      </Canvas>
    </div>
  );
}
