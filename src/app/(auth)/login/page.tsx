"use client";

import AuthLeftSection from "@/components/pages/auth/AuthLeftSection";
import AuthRightSection from "@/components/pages/auth/AuthRightSection";
import LoginForm from "@/components/pages/auth/forms/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card-main">
      <AuthLeftSection
        title="Welcome Back to Haykal"
        description="Continue your journey with build and control and achieve your goals."
      />
      <AuthRightSection title="LogIn" subtitle="Welcome to Haykal">
        <LoginForm />
      </AuthRightSection>
    </div>
  );
}
