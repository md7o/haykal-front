"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import { FormField } from "@/components/ui-tools/ui/form-field";
import { PasswordStrengthIndicator } from "@/components/ui-tools/ui/password-strength";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { signUp, verifySignUp } from "@/api/auth-api/auth-endpoints";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui-tools/ui/input-otp";

interface SignUpFormProps {
  onSuccess?: (email: string) => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [emailForOtp, setEmailForOtp] = useState<string>("");
  const [usernameForOtp, setUsernameForOtp] = useState<string>("");
  const [passwordForOtp, setPasswordForOtp] = useState<string>("");
  const router = useRouter();

  function getResendTimerText(timer: number) {
    if (timer > 0) {
      const minutes = Math.floor(timer / 60);
      const seconds = (timer % 60).toString().padStart(2, "0");
      return `You can resend code after ${minutes}:${seconds}`;
    }
    return "Resend code";
  }
  useEffect(() => {
    if (step !== "otp") return;
    if (resendTimer <= 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, resendTimer]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid, touchedFields },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await signUp(data.email, data.username, data.password);
      setEmailForOtp(data.email);
      setUsernameForOtp(data.username);
      setPasswordForOtp(data.password);
      setStep("otp");
      setResendTimer(90);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred during registration. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSubmitError(null);
    if (!emailForOtp) {
      setSubmitError("Missing email. Please start again.");
      setStep("form");
      return;
    }
    try {
      await signUp(emailForOtp, usernameForOtp, passwordForOtp);
      if (timerRef.current) clearInterval(timerRef.current);
      setResendTimer(90);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to resend code");
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setSubmitError(null);

    // Guard: Email must be present
    if (!emailForOtp) {
      setSubmitError("Missing email. Please start again.");
      setStep("form");
      setVerifying(false);
      return;
    }

    // Guard: OTP must be 6 digits
    if (otp.length < 6) {
      setSubmitError("Please enter the 6-digit code.");
      setVerifying(false);
      return;
    }

    try {
      // 1. Verify OTP
      const verifyResponse = await verifySignUp(emailForOtp, otp);

      // 2. Update auth store with verified user data
      useAuthStore
        .getState()
        .setAuth(
          { userId: verifyResponse.userId, email: verifyResponse.email, username: verifyResponse.username },
          verifyResponse.accessToken,
          verifyResponse.accessTokenExpiry,
        );

      // 3. Optional success callback
      onSuccess?.(emailForOtp);

      // 4. Redirect to home
      router.push("/");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
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
      {step === "form" ? (
        <>
          {/* Sign Up Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
            {/* Username Field */}
            <FormField
              label="Username"
              type="text"
              placeholder="Enter your username"
              error={errors.username?.message}
              touched={touchedFields.username || submitAttempted}
              {...register("username")}
            />

            {/* Email Field */}
            <FormField
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              touched={touchedFields.email || submitAttempted}
              {...register("email")}
            />

            {/* Password Field */}
            <div className="space-y-3">
              <FormField
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                touched={touchedFields.password || submitAttempted}
                {...register("password")}
              />
              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={passwordValue} showSuggestions={!!passwordValue && !errors.password} />
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {submitError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={!isValid || isSubmitting} size="huge">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-description">
                Already have an account?{" "}
                <Link href="/login" className="text-accent font-medium hover:underline transition-all">
                  Log in
                </Link>
              </p>
            </div>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-description">
              By signing up, you agree to our{" "}
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
      ) : (
        <div className="space-y-6 w-full max-w-sm mx-auto">
          <p className="text-sm text-muted-foreground">We sent a 6-digit code to {emailForOtp}. Enter it below to continue.</p>
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <Button onClick={handleVerify} disabled={otp.length !== 6 || verifying} size="huge">
              {verifying ? "Verifying..." : "Continue"}
            </Button>
            <Button
              type="button"
              onClick={handleResend}
              className={`w-full text-sm ${resendTimer > 0 ? "text-gray-400" : "text-accent hover:underline cursor-pointer"}`}
              disabled={resendTimer > 0}
            >
              {getResendTimerText(resendTimer)}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
