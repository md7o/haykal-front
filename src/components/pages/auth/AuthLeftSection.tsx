import Image from "next/image";

interface AuthLeftSectionProps {
  title: string;
  description?: string;
}

export default function AuthLeftSection({
  title,
  description,
}: AuthLeftSectionProps) {
  return (
    <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gradient-primary to-gradient-secondary p-8 lg:p-12 flex-col justify-center items-center text-center relative overflow-hidden my-3 rounded-tr-curvey rounded-br-curvey shadow-lg">
      {/* Project Image */}
      <div className="mb-8 lg:mb-12 w-full max-w-md">
        <Image
          src="/assets/images/dashboard.png"
          alt="Haykal Dashboard"
          priority
          width={400}
          height={300}
          className="w-full h-auto rounded-soft shadow-lg"
        />
      </div>

      {/* Large descriptive text */}
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg text-white leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
