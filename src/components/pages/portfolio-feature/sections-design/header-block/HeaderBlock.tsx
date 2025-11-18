import Image from "next/image";

export interface HeaderConfig {
  siteName: string;
  logoSrc?: string;
  fixed?: boolean;
  active?: boolean;
  backgroundType?: "none" | "normal";
  // Optional pages list to render simple navigation (injected at runtime by DisplayPage)
  pages?: Array<{ id: string; title: string; slug?: string | null }>;
}

interface HeaderDesignProps {
  config: HeaderConfig;
  view?: "desktop" | "mobile";
}

// A simple top navigation header that can stick to the top of the preview
export default function HeaderBlock({ config, view = "desktop" }: HeaderDesignProps) {
  const { siteName, logoSrc, fixed = true, backgroundType = "normal", pages = [] } = config;

  const hasBg = backgroundType === "normal";
  const wrapperClasses = `${fixed ? "sticky top-0" : ""} z-50 w-full ${
    hasBg ? "bg-card-bg/90 backdrop-blur supports-[backdrop-filter]:bg-card-bg/60" : ""
  }`;
  const innerWidth = view === "mobile" ? "xl:w-[25rem] w-full" : "w-full";

  return (
    <header className={wrapperClasses}>
      <div className={`mx-auto ${innerWidth} px-5 py-3 flex items-center gap-3`}>
        {logoSrc ? <img src={logoSrc} alt="Logo" className="w-10 h-auto" /> : null}
        <span className="text-base font-semibold text-title truncate">{siteName || "Site Name"}</span>
        {Array.isArray(pages) && pages.length > 0 ? (
          <nav className="ml-auto">
            <ul className="flex items-center gap-4">
              {pages.map((p) => (
                <li key={p.id} className="text-sm text-description hover:text-title transition-colors cursor-pointer">
                  <a href={p.slug ? `#${p.slug}` : "#"}>{p.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
