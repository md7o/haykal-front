"use client";

import { Button } from "@/components/ui/shadcn_ui/button";
import Header from "@/components/layouts/Header";

export default function HeroSection() {
  return (
    <>
      <div
        className="relative min-h-screen bg-cover bg-center pt-20"
        style={{
          backgroundImage: 'url("/assets/images/ArtBackground.jpg")',
        }}
      >
        <Header />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl"></div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 20%, rgba(33,33,33,1) 100%)",
          }}
        ></div>
        <section className="flex items-center justify-center min-h-screen vignette-overlay">
          <div data-aos="fade-up" data-aos-duration="800" className="relative text-center max-w-3xl space-y-10">
            <div className="space-y-5">
              <h1 className="text-accent sm:text-7xl text-5xl font-bold r">From Spark to Scale</h1>
              <h2 className="text-title sm:text-5xl text-4xl">The Complete Creator Ecosystem</h2>
            </div>
            <p className="text-description sm:text-2xl text-xl">
              Launch your vision faster. The all-in-one toolkit to upgrade your ideas
            </p>

            <Button variant="fill" size={"large"} className="uppercase mt-10" asChild>
              <a href="#tools">Explore Now</a>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
