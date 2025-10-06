import SignupForm from "@/components/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-black p-10 text-white lg:flex">
        <div className="text-xl font-semibold">Axyl</div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl leading-tight font-bold">
            Start building with your free plan
          </h1>
          <p>No credit card required.</p>
        </div>
        <div className="text-muted-foreground text-xs">
          © 2025 All rights reserved.
        </div>
      </section>

      <section className="from-background via-background to-background relative flex items-center justify-center bg-gradient-to-br p-6 lg:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>
                Create your account to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
