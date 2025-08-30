import { Button } from "@/components/ui/button";

export default function GetStartedSection() {
  return (
    <section>
      <div className="bg-primary w-full py-16 flex flex-col justify-center items-center text-center">
        <h2
          data-aos="fade-up"
          className="max-w-md  text-3xl sm:text-5xl font-bold text-title"
        >
          Start Creating And Build Portfolio.
        </h2>
        <p
          data-aos="fade-up"
          className="max-w-lg text-description text-sm sm:text-md px-2 mb-10 mt-5"
        >
          Start With A Full Landing Page Or Craft Custom Sections - Your Design,
          Your Rules!
        </p>
        <Button
          data-aos="fade-up"
          variant="fill"
          size={"large"}
          className="uppercase"
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
