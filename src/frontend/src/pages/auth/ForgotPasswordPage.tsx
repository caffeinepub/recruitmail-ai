import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Mail className="text-primary-foreground" size={18} />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            RecruitMail AI
          </span>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-success w-7 h-7" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              If an account with <strong>{email}</strong> exists, we've sent
              reset instructions.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Forgot password?
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
