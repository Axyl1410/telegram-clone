"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="to-background pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
      <div className="relative mx-auto w-full max-w-2xl text-center">
        <p>404</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-3">
          The page you’re looking for may have been moved, deleted, or never
          existed.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>

        <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
