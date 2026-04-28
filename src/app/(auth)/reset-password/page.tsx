"use client";

import AuthRightSection from "@/components/pages/auth-pages/AuthSection";
import ResetPasswordForm from "@/components/pages/auth-pages/forms/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthRightSection>
        <ResetPasswordForm />
      </AuthRightSection>
    </div>
  );
}
