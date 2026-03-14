"use client";

import AuthLeftSection from "@/components/pages/auth-pages/AuthLeftSection";
import AuthRightSection from "@/components/pages/auth-pages/AuthRightSection";
import ForgotPasswordForm from "@/components/pages/auth-pages/forms/ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthLeftSection
        title="Welcome Back to Haykal"
        description="Continue your journey with build and control and achieve your goals."
      />
      <AuthRightSection title="Recover Password">
        <ForgotPasswordForm />
      </AuthRightSection>
    </div>
  );
}
