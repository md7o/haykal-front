"use client";

import { AuthLeftSection, AuthRightSection, SignUpForm } from "@/components/pages/auth";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
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
