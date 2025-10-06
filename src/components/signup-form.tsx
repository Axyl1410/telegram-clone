"use client";

import { Button } from "@/components/ui/button";
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

type SignupFormProps = React.HTMLAttributes<HTMLDivElement>;

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, "Min 6 characters"),
});

export function SignupForm({ className, ...props }: SignupFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        username: values.username,
        displayUsername: values.name?.trim() ? values.name : values.username,
      });
      if (signUpError) {
        toast.error(signUpError.message || "Failed to sign up");
      } else {
        toast.success("Account created successfully");
        router.push("/sign-in");
      }
    } catch (_err) {
      toast.error("Failed to sign up");
    }
  }

  const signInWith = async (provider: "google" | "github" | "discord") => {
    const { error } = await authClient.signIn.social({ provider });
    if (error) toast.error(error.message || "Failed to continue");
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

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
