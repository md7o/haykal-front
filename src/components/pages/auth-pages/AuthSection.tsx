import { ReactNode } from "react";
import Image from "next/image";

interface AuthSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthSection({ title, subtitle, children }: AuthSectionProps) {
  return (
    <div className="flex justify-center items-center w-full mx-auto">
      <div className="w-full max-w-xl mx-auto">
        {/* Project Logo */}
        <div className="mb-8">
          <Image src="/assets/images/Haykal-Logo.png" alt="Haykal Logo" width={100} height={100} className="mx-auto w-24" />
        </div>
        {/* Title and Welcome */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-title mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-description">{subtitle}</p>}
        </div>

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
}
