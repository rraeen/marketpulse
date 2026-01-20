"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep logging minimal but useful
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <div className="flex-1 py-10 md:py-14">
      <Container>
        <div className="max-w-xl mx-auto bg-background border border-border rounded-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-6">
            Please try again. If the issue continues, go back home and restart from there.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="bg-yellow-400 text-slate-900 hover:bg-yellow-300">
              Retry
            </Button>
            <Link href="/" className="sm:self-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

