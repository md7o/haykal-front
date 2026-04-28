"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { FormField } from "@/components/ui/shadcn_ui/form-field";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { signIn } from "@/lib/api/auth-api/auth-endpoints";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/helpers/error-handler";

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const redirectPath = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isInitialized && !isLoading && user) {
      router.replace(redirectPath);
    }
  }, [isInitialized, isLoading, user, router, redirectPath]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    trigger,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Handle login form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Sign in and get response
      const response = await signIn(data.email, data.password);

      // Update auth store
      useAuthStore
        .getState()
        .setAuth(
          { userId: response.userId, email: response.email, username: response.username, role: response.role },
          response.accessToken,
          response.accessTokenExpiry,
        );

      router.push(redirectPath);
    } catch (error) {
      const { message } = getErrorMessage(error);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const valid = await trigger();
    if (valid) {
      handleSubmit(onSubmit)(e);
    }
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
        <FormField
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          touched={touchedFields.email || submitAttempted}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          touched={touchedFields.password || submitAttempted}
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-accent font-medium hover:underline transition-all">
            Forgot Password?
          </Link>
        </div>
        {submitError && (
          <div className="p-3 bg-error/50 rounded-soft">
            <p className="text-sm  flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </p>
          </div>
        )}
        <Button type="submit" disabled={!isValid || isSubmitting} size="huge">
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-description">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent font-medium hover:underline transition-all">
            Sign Up
          </Link>
        </p>
      </div>
      {/* Legal links */}
      <div className="mt-6 text-center">
        <p className="text-xs text-description">
          By logging in, you agree to our{" "}
          <Link href="/terms" className="text-accent hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
