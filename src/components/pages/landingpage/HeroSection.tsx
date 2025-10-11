import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex flex-col xl:flex-row items-center justify-center gap-24 px-6 2xl:mx-36 text-center xl:text-left">
      <div data-aos="fade-up" data-aos-duration="800" className="relative max-w-lg space-y-5">
        <Image
          src="/assets/images/Circle.png"
          alt="Jeddah Albalad Logo"
          width={500}
          height={500}
          priority
          className="w-20 absolute -top-1 xl:top-0 right-8 xl:right-15"
        />
        <h1 className="text-title sm:text-7xl text-6xl font-bold relative">Design Your Portfolio With Pick-and Click</h1>
        <p className="text-description">
          Total control, zero complexity and customize every section your way, Launch a professional portfolio in minutes, no tech
          skills needed.
        </p>
        <Image
          src="/assets/images/Sparkle.png"
          alt="Jeddah Albalad Logo"
          width={500}
          height={500}
          className="w-20 absolute -right-0 xl:right-20 bottom-30 hidden sm:block"
        />
        {/* use route navigate to /category-type */}
        <Button asChild variant="fill" size={"small"} className="uppercase">
          <Link href={"/studio"} aria-label="Get started with Haykal">
            Get started
          </Link>
        </Button>
      </div>
      <div data-aos="fade-up" className="">
        <Image
          src={"/assets/images/dashboard.png"}
          alt="Jeddah Albalad Logo"
          priority
          width={500}
          height={500}
          className="w-[30rem] hover:scale-95 duration-300"
        />
      </div>
    </section>
  );
}
