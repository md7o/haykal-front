"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-tools/ui/button";
import { FormField } from "@/components/ui-tools/ui/form-field";
import { resetPassword } from "@/api/auth-api/auth-endpoints";
import { useRecoveryPassword } from "@/context/RecoveryPasswordContext";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { email, code, setCode } = useRecoveryPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle password reset form submission
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Missing email. Please start the process again.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!code) {
      setError("Missing or invalid code. Please request a new code and try again.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email, code, password, confirmPassword);
      setSuccess(true);
      setCode(""); // Clear code after successful reset
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      {success ? (
        <div className="text-green-600 font-semibold">Password reset successfully! Redirecting to login...</div>
      ) : (
        <form onSubmit={handleReset} className="space-y-6 w-full max-w-sm">
          <FormField
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && !password ? error : undefined}
            touched={!!error || password.length > 0}
          />
          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              error && password && !confirmPassword ? error : password !== confirmPassword ? "Passwords do not match." : undefined
            }
            touched={!!error || confirmPassword.length > 0}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting || !password || !confirmPassword} size="huge">
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
