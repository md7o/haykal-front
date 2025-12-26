import { GraduationCap, MapPin, Calendar, UserStar, Building2 } from "lucide-react";

type SocialLinksConfig = {
  careerType?: "experience-career" | "education-career";
  color?: string;
  title?: string;
  facilityName?: string;
  location?: string;
  date?: string;
  note?: string;
  background?: "with-background" | "without-background";
};

export default function CareerBlock({
  config,
  view,
}: {
  config: SocialLinksConfig & { socialLinks?: string[] };
  view?: "desktop";
}) {
  return (
    <section className={`${view === "desktop" ? "xl:w-[50rem] w-full xl:px-0 px-5" : "w-full px-5"} mx-auto`}>
      <div className="">
        {config.careerType === "education-career" ? (
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap size={30} className="text-accent" />
            <h2 className="text-2xl font-bold">Educations</h2>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-5">
            <UserStar size={30} className="text-accent" />
            <h2 className="text-2xl font-bold">Experiences</h2>
          </div>
        )}
        <div className={`${config.background !== "without-background" ? "rounded-base bg-card-bg p-6" : ""}`}>
          {config.title && <h2 className="text-2xl font-semibold mb-2">{config.title}</h2>}

          {(() => {
            const infoItems: { id: string; value?: string; icon?: React.ReactNode }[] = [
              { id: "facilityName", value: config.facilityName, icon: <Building2 size={18} className="" /> },
              { id: "location", value: config.location, icon: <MapPin size={18} className="" /> },
              { id: "date", value: config.date, icon: <Calendar size={18} className="" /> },
            ];

            return (
              <div className={` ${view === "desktop" ? "xl:flex" : "block space-y-2"} gap-5 my-3`}>
                {infoItems.map((item) =>
                  item.value ? (
                    item.icon ? (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.icon}
                        <div className="">{item.value}</div>
                      </div>
                    ) : (
                      <div key={item.id}>{item.value}</div>
                    )
                  ) : null
                )}
              </div>
            );
          })()}
          <p className="mt-8 mb-5">{config.note}</p>
        </div>
      </div>
      {/* {content} */}
    </section>
  );
}
