"use client";

import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    // console.error(error);
  }, []);

  return (
    <html lang="en">
      <body>
        <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="relative mx-auto w-full max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border bg-background/60 shadow-sm backdrop-blur">
              <TriangleAlert className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Something went wrong
            </h1>
            <p className="mt-3 text-muted-foreground">
              An unexpected error occurred. Please try again.
              {error?.digest ? ` (ref: ${error.digest})` : null}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={() => reset()}>Try again</Button>
            </div>
            <div className="pointer-events-none absolute -z-10 left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
      </body>
    </html>
  );
}
