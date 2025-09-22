import { Youtube, Instagram, Facebook, Twitter, Linkedin, Github, Link } from "lucide-react";

type SocialLinksConfig = {
  socialLinks: string[];
  color?: string;
  blockstyle?: "grid-style" | "card-style" | "icon-style" | "transparent-style";
};

function detectPlatformIcon(url?: string) {
  if (!url) return Link;
  const u = url.toLowerCase();
  if (u.includes("youtube") || u.includes("youtu.be")) return Youtube;
  if (u.includes("instagram")) return Instagram;
  if (u.includes("facebook")) return Facebook;
  if (u.includes("twitter")) return Twitter;
  if (u.includes("github")) return Github;
  if (u.includes("linkedin")) return Linkedin;
  // return link with text
  if (u.includes(Link.name.toLowerCase())) return Link;
  return Link;
}

export default function SocialLinksBlock({
  config,
  view,
}: {
  config: SocialLinksConfig & { socialLinks?: string[] };
  view?: "desktop";
}) {
  const links = config.socialLinks || [];

  let content: React.ReactNode = null;
  const iconClass = `${view === "desktop" ? "w-8 h-8" : "w-6 h-6"}`;

  if (config.blockstyle === "icon-style" || config.blockstyle === "transparent-style") {
    content = (
      <div className="flex items-center justify-center gap-4">
        {links.map((url, i) => {
          const Icon = detectPlatformIcon(url);
          return (
            <a
              key={i}
              href={url || "#"}
              target={url ? "_blank" : undefined}
              rel={url ? "noopener noreferrer" : undefined}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                config.blockstyle === "icon-style" ? "bg-gray-100 hover:bg-gray-200" : ""
              }`}
            >
              <Icon className="w-6 h-6" />
            </a>
          );
        })}
      </div>
    );
  } else if (config.blockstyle === "card-style") {
    content = (
      <div className="flex flex-col items-center gap-4">
        {links.map((url, i) => {
          const Icon = detectPlatformIcon(url);
          return (
            <a
              key={i}
              href={url || "#"}
              target={url ? "_blank" : undefined}
              rel={url ? "noopener noreferrer" : undefined}
              className="flex justify-center items-center gap-2 p-4 bg-card-bg rounded-soft hover:scale-[97%] duration-200 min-w-[12rem]"
            >
              <Icon className={iconClass} />
              <span className={`${view === "desktop" ? "text-lg font-semibold" : "text-sm font-medium"} `}>
                {url
                  ? url
                      .replace(/^https?:\/\//, "")
                      .replace(/www\./, "")
                      .split("/")[0]
                      .split(".")[0]
                  : "Link"}
              </span>
            </a>
          );
        })}
      </div>
    );
  } else {
    const colCount = Math.min(links.length, 4) || 1;
    let gridColsClass = "grid-cols-1";
    let maxWidthClass = "max-w-xs";

    if (colCount === 1) {
      gridColsClass = "grid-cols-1";
      maxWidthClass = "max-w-xs";
    } else if (colCount === 2) {
      gridColsClass = "grid-cols-2";
      maxWidthClass = "max-w-xs";
    } else if (colCount === 3) {
      gridColsClass = "grid-cols-3";
      maxWidthClass = "max-w-md";
    } else if (colCount === 4) {
      gridColsClass = "grid-cols-4";
      maxWidthClass = "max-w-2xl";
    }

    content = (
      <div className={`mx-auto grid place-items-center gap-4 ${gridColsClass} ${view === "desktop" ? maxWidthClass : ""}`}>
        {links.map((url, i) => {
          const Icon = detectPlatformIcon(url);
          return (
            <a
              key={i}
              href={url || "#"}
              target={url ? "_blank" : undefined}
              rel={url ? "noopener noreferrer" : undefined}
              className={`flex items-center justify-center ${
                view === "desktop" ? "w-32 h-32" : "w-20 h-20"
              } flex flex-col rounded-base bg-card-bg hover:scale-[97%] duration-200`}
            >
              <Icon className={iconClass} />

              <span className={`${view === "desktop" ? "text-lg font-semibold" : "text-sm font-medium"} break-words text-center`}>
                {url
                  ? url
                      .replace(/^https?:\/\//, "")
                      .replace(/www\./, "")
                      .split("/")[0]
                      .split(".")[0]
                  : "Link"}
              </span>
            </a>
          );
        })}
      </div>
    );
  }

  return <section className="py-8 px-6">{content}</section>;
}
