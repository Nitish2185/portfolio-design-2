import { experience, experienceIntro } from "../data/profile";

// Static timeline, as on the reference site: only hover colour transitions
export default function Experience() {
  return (
    <section
      id="experience"
      className="relative py-16 sm:py-24 md:py-40 overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-iron to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[90vw] max-w-[600px] h-[300px] rounded-full opacity-15 pointer-events-none blur-[150px]"
        style={{ backgroundColor: "var(--ember)" }}
      />

      <div className="section-container relative z-10 px-4 sm:px-6 md:px-8">
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-ember inline-block rounded-full" />
            <span className="text-ember text-xs font-bold tracking-[0.25em] uppercase">{experienceIntro.label}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            {experienceIntro.title}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-ash max-w-xl leading-relaxed font-normal">
            {experienceIntro.subtitle}
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12 max-w-4xl mx-auto">
          {experience.map((item) => (
            <div
              key={item.role + item.period}
              className="exp-item group pb-8 sm:pb-12 border-b border-white/10 last:border-b-0 flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 md:gap-12 transition-colors duration-300"
            >
              <div className="md:w-1/3 flex-shrink-0">
                <span className="text-xs font-mono font-medium text-ash tracking-wider block mb-1">{item.period}</span>
                <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase block font-mono text-ember">
                  {item.company}
                </span>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 tracking-tight group-hover:text-cloud transition-colors">
                  {item.role}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-ash leading-relaxed mb-4 sm:mb-6 font-normal">
                  {item.summary}
                </p>
                <ul className="space-y-2.5">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-silver font-normal">
                      <span className="text-ember font-bold mt-0.5 text-xs">▸</span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
