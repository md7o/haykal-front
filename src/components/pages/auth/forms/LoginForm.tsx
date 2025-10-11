"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { signIn, me } from "@/api/auth-endpoints";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const { setIsLogged, setUser } = useAuth();

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
      await signIn({ email: data.email, password: data.password });
      const userData = await me();
      setIsLogged(true);
      setUser(userData);
      // Support middleware-provided ?next=... param
      const next = search?.get("next");
      router.push(next || "/dashboard/sections");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred during login. Please try again.");
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </p>
          </div>
        )}
        <Button type="submit" disabled={!isValid || isSubmitting} size="huge">
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </div>
          ) : (
            "Sign In"
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
