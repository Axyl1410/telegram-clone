"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

type SignupFormProps = React.HTMLAttributes<HTMLDivElement>;

export function SignupForm({ className, ...props }: SignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
        username,
        // Prefer a friendly displayUsername; fallback to `name` or raw username
        displayUsername: name?.trim() ? name : username,
      });
      if (signUpError) {
        const message = signUpError.message || "Failed to sign up";
        setError(message);
        toast.error(message);
      } else {
        toast.success("Account created successfully");
        router.push("/sign-in");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const signInWith = async (provider: "google" | "github" | "discord") => {
    setLoading(true);
    setError(null);
    try {
      const { error: socialError } = await authClient.signIn.social({
        provider,
      });
      if (socialError) {
        const message = socialError.message || "Failed to continue";
        setError(message);
        toast.error(message);
      } else {
        toast.success("Redirecting to provider…");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to continue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)} {...props}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            placeholder="your_username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="••••••••"
            required
          />
        </div>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWith("google")}
          disabled={loading}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWith("github")}
          disabled={loading}
        >
          GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWith("discord")}
          disabled={loading}
        >
          Discord
        </Button>
      </div>
    </div>
  );
}

export default SignupForm;
