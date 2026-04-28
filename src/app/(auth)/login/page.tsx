"use client";

import AuthRightSection from "@/components/pages/auth-pages/AuthSection";
import LoginForm from "@/components/pages/auth-pages/forms/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card-main">
      <AuthRightSection title="LogIn" subtitle="Welcome to Haykal">
        <LoginForm />
      </AuthRightSection>
    </div>
  );
}
