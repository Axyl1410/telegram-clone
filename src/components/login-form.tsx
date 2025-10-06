"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type LoginFormProps = React.HTMLAttributes<HTMLDivElement>;

const loginSchema = z
  .object({
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(6, "Min 6 characters"),
    rememberMe: z.boolean(),
    useUsername: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.useUsername) {
      if (!val.username || !val.username.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["username"],
          message: "Username is required",
        });
      }
    } else {
      const emailCheck = z
        .string()
        .email()
        .safeParse(val.email ?? "");
      if (!emailCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Valid email is required",
        });
      }
    }
  });

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const form = useForm<
    z.infer<typeof loginSchema>,
    unknown,
    z.infer<typeof loginSchema>
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      rememberMe: false,
      useUsername: false,
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const { error: signInError } = values.useUsername
        ? await authClient.signIn.username({
            username: values.username as string,
            password: values.password,
            rememberMe: values.rememberMe,
          })
        : await authClient.signIn.email({
            email: values.email as string,
            password: values.password,
            rememberMe: values.rememberMe,
          });
      if (signInError) {
        toast.error(signInError.message || "Failed to sign in");
      } else {
        toast.success("Signed in successfully");
        router.push("/");
      }
    } catch (_err) {
      toast.error("Failed to sign in");
    }
  }

  const signInWith = async (provider: "google" | "github" | "discord") => {
    const { error } = await authClient.signIn.social({ provider });
    if (error) toast.error(error.message || "Failed to sign in");
  };

  const loading = form.formState.isSubmitting;

  return (
    <div className={cn("w-full max-w-sm space-y-4", className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, () => {
            const errs = form.formState.errors as Record<
              string,
              { message?: string }
            >;
            const first = Object.values(errs)[0]?.message;
            if (first) toast.error(first);
          })}
          className="space-y-4"
        >
          {form.watch("useUsername") ? (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <FormControl>
                    <Input
                      id="username"
                      type="text"
                      placeholder="your_username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between gap-4">
            <FormField
              control={form.control}
              name="useUsername"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                  </FormControl>
                  <FormLabel>Sign in with username</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                  </FormControl>
                  <FormLabel>Remember me</FormLabel>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="text-muted-foreground text-sm">
        Don't have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary underline underline-offset-4"
        >
          Create one
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

export default LoginForm;
