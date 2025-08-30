type PreviewConfig = {
  type: "mobile" | "desktop";
  width: string;
  height: string;
  cardLayout: {
    top: number;
    bottom: { base: number; sm: number }; // 👈 responsive
    cols: number;
  };
};

const previews: PreviewConfig[] = [
  {
    type: "mobile",
    width: "w-52",
    height: "h-[22rem]",
    cardLayout: { top: 1, bottom: { base: 4, sm: 4 }, cols: 2 },
  },
  {
    type: "desktop",
    width: "sm:w-[28rem] w-[19rem]",
    height: "sm:h-[22rem] h-[15rem]",
    cardLayout: { top: 1, bottom: { base: 2, sm: 4 }, cols: 2 },
  },
];

function BrowserFrame({
  width,
  height,
  cardLayout,
}: {
  width: string;
  height: string;
  cardLayout: PreviewConfig["cardLayout"];
}) {
  return (
    <div className={`${width} ${height} bg-[#E5E5E5] rounded-xl shadow-md`}>
      {/* Browser top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-700 rounded-t-xl">
        <span className="w-3 h-3 bg-red-400 rounded-full"></span>
        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
        <span className="w-3 h-3 bg-green-400 rounded-full"></span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {/* Top cards */}
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: cardLayout.top }).map((_, i) => (
            <div key={`top-${i}`} className="bg-primary h-20 rounded-lg"></div>
          ))}
        </div>

        {/* Bottom cards */}
        <div
          className={`grid gap-3`}
          style={{ gridTemplateColumns: `repeat(${cardLayout.cols}, 1fr)` }}
        >
          {/* base */}
          {cardLayout.bottom.base > 0 &&
            Array.from({ length: cardLayout.bottom.base }).map((_, i) => (
              <div
                key={`bottom-base-${i}`}
                className="bg-primary h-20 rounded-lg sm:hidden"
              ></div>
            ))}

          {/* sm+ */}
          {cardLayout.bottom.sm > 0 &&
            Array.from({ length: cardLayout.bottom.sm }).map((_, i) => (
              <div
                key={`bottom-sm-${i}`}
                className="bg-primary h-20 rounded-lg hidden sm:block"
              ></div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function ResponsiveSection() {
  return (
    <section className="text-center py-12">
      {/* Heading */}
      <h2
        data-aos="fade-up"
        className="text-3xl md:text-4xl font-bold text-title"
      >
        Complete Allocation And Support
      </h2>
      <p data-aos="fade-up" className="mt-2 text-description">
        It is easy to build the portfolio using both Desktop or Mobile phone
      </p>

      <div
        data-aos="fade-up"
        className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8"
      >
        {previews.map((p) => (
          <div
            key={p.type}
            className="flex flex-col items-center gap-4 text-3xl font-bold"
          >
            <h2>{p.type}</h2>
            <BrowserFrame
              key={p.type}
              width={p.width}
              height={p.height}
              cardLayout={p.cardLayout}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
