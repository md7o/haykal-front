"use client";

import AuthRightSection from "@/components/pages/auth-pages/AuthSection";
import ForgotPasswordForm from "@/components/pages/auth-pages/forms/ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthRightSection title="Recover Password">
        <ForgotPasswordForm />
      </AuthRightSection>
    </div>
  );
}
