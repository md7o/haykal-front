"use client";

import AuthLeftSection from "@/components/pages/auth/AuthLeftSection";
import AuthRightSection from "@/components/pages/auth/AuthRightSection";
import ResetPasswordForm from "@/components/pages/auth/forms/ResetPasswordForm";

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
