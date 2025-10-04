import LoginForm from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
