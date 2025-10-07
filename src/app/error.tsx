"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
          <div className="to-background pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
          <div className="relative mx-auto w-full max-w-2xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mt-3">
              An unexpected error occurred. Please try again.
              {error?.digest ? ` (ref: ${error.digest})` : null}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant={"outline"} onClick={() => router.push("/")}>
                Go home
              </Button>
            </div>
            <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
          </div>
        </div>
      </body>
    </html>
  );
}
