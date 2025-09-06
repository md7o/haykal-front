"use client";

import {
  AuthLeftSection,
  AuthRightSection,
  LoginForm,
} from "@/components/pages/auth";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
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
