import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-24 px-6 2xl:mx-36 text-center xl:text-left">
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="relative max-w-lg space-y-5"
      >
        <Image
          src="/assets/images/Circle.png"
          alt="Jeddah Albalad Logo"
          width={500}
          height={500}
          priority
          className="w-20 absolute -top-2 xl:top-0 right-13 xl:right-28"
        />
        <h1 className="text-title sm:text-7xl text-6xl font-bold relative">
          Design Your Portfolio With Pick-and Click
        </h1>
        <p className="text-description">
          Total control, zero complexity and customize every section your way,
          Launch a professional portfolio in minutes, no tech skills needed.
        </p>
        <Image
          src="/assets/images/Sparkle.png"
          alt="Jeddah Albalad Logo"
          width={500}
          height={500}
          className="w-20 absolute -right-15 xl:-right-10 bottom-25 hidden sm:block"
        />
        <Button variant="fill" size={"small"} className="uppercase">
          Get started
        </Button>
      </div>
      <div data-aos="fade-up">
        <Image
          src={"/assets/images/dashboard.png"}
          alt="Jeddah Albalad Logo"
          property="true"
          width={500}
          height={500}
          className="w-[30rem]"
        />
      </div>
    </div>
  );
}
