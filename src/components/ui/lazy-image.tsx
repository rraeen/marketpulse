"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

export function LazyImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
  unoptimized = false,
}: LazyImageProps) {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || shouldLoad) return; // Already loading or priority

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  const isBase64 = src.startsWith("data:");

  if (fill) {
    if (shouldLoad) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          unoptimized={unoptimized || isBase64}
        />
      );
    }
    
    return (
      <div ref={containerRef} className="absolute inset-0 bg-muted animate-pulse" />
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          unoptimized={unoptimized || isBase64}
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse" />
      )}
    </div>
  );
}
