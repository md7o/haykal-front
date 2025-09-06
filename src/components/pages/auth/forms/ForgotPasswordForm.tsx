"use client";

import { useState, useRef, useEffect } from "react";
import { forgotPassword } from "@/api/auth-endpoints";
import { useRecoveryPassword } from "@/context/RecoveryPasswordContext";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function ForgotPasswordForm() {
  function getResendTimerText(timer: number) {
    if (timer > 0) {
      const minutes = Math.floor(timer / 60);
      const seconds = (timer % 60).toString().padStart(2, "0");
      return `You can resend code after ${minutes}:${seconds}`;
    }
    return "Resend code";
  }
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { email, setEmail, setCode } = useRecoveryPassword();
  const router = useRouter();

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
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

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setStep("otp");
      setResendTimer(90);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("No account found with this email address.");
      } else if (err?.response?.status === 429) {
        setError("Too many requests. Please wait before trying again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send reset code. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    if (!email) {
      setError("Missing email. Please start again.");
      setStep("email");
      return;
    }
    try {
      await forgotPassword(email);
      if (timerRef.current) clearInterval(timerRef.current);
      setResendTimer(90);
      window.localStorage.setItem("reset-otp-timer", JSON.stringify({ expiresAt: Date.now() + 90 * 1000 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);

    if (!email) {
      setError("Missing email. Please start again.");
      setStep("email");
      setVerifying(false);
      return;
    }

    if (otp.length < 6) {
      setError("Please enter the 6-digit code.");
      setVerifying(false);
      return;
    }

    try {
      // Save OTP and go to reset password step
      setCode(otp);
      router.push("/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-6 w-full max-w-sm">
          <FormField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error || undefined}
            touched={!!error || email.length > 0}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-base text-green-600">Reset code sent! Please check your email.</p>}
          <Button type="submit" disabled={isSubmitting || success} size="huge">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Code...
              </div>
            ) : (
              "Send Code"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-6 w-full max-w-sm">
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to {email}. Enter it below to continue.
          </p>
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleVerify} disabled={otp.length !== 6 || verifying} size="huge">
              {verifying ? "Verifying..." : "Continue"}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              className={`w-full text-sm ${
                resendTimer > 0 ? "text-gray-400" : "text-accent hover:underline cursor-pointer"
              }`}
              disabled={resendTimer > 0}
            >
              {getResendTimerText(resendTimer)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
