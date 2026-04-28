"use client";

import AuthSection from "@/components/pages/auth-pages/AuthSection";
import SignUpForm from "@/components/pages/auth-pages/forms/SignUpForm";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card-main">
      <AuthSection title={"Sign Up"} subtitle={"Welcome to Haykal"}>
        <SignUpForm />
      </AuthSection>
    </div>
  );
}
