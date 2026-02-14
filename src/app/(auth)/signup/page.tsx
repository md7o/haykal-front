"use client";

import AuthLeftSection from "@/components/pages/auth/AuthLeftSection";
import AuthRightSection from "@/components/pages/auth/AuthRightSection";
import SignUpForm from "@/components/pages/auth/forms/SignUpForm";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card-main">
      <AuthLeftSection
        title="Design Your Portfolio With Pick-and Click"
        description="Total control, zero complexity and customize every section your way, Launch a professional portfolio in minutes, no tech skills needed."
      />
      <AuthRightSection title={"Sign Up"} subtitle={"Welcome to Haykal"}>
        <SignUpForm />
      </AuthRightSection>
    </div>
  );
}
