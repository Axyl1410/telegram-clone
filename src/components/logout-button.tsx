"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type LogoutButtonProps = {
  redirectTo?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  children?: React.ReactNode;
};

export default function LogoutButton({
  redirectTo = "/sign-in",
  variant = "outline",
  size,
  className,
  children,
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message || "Failed to sign out");
      } else {
        toast.success("Signed out");
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
    >
      {children ?? (loading ? "Signing out..." : "Sign out")}
    </Button>
  );
}
