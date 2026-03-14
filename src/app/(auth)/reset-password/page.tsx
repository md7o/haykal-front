"use client";

import AuthLeftSection from "@/components/pages/auth-pages/AuthLeftSection";
import AuthRightSection from "@/components/pages/auth-pages/AuthRightSection";
import ResetPasswordForm from "@/components/pages/auth-pages/forms/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthLeftSection
        title="Reset Password"
        description="Continue your journey with build and control and achieve your goals."
      />
      <AuthRightSection>
        <ResetPasswordForm />
      </AuthRightSection>
    </div>
  );
}
