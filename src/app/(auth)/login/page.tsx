"use client";

import AuthLeftSection from "@/components/pages/auth-pages/AuthLeftSection";
import AuthRightSection from "@/components/pages/auth-pages/AuthRightSection";
import LoginForm from "@/components/pages/auth-pages/forms/LoginForm";

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
