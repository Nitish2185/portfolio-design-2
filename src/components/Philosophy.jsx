import { philosophy } from "../data/profile";
import ScrollExpandMedia from "./ScrollExpandMedia";

export default function Philosophy() {
  return (
    <section id="introduction" className="relative w-full">
      <ScrollExpandMedia
        src={philosophy.image}
        alt={philosophy.imageAlt}
        title={philosophy.title}
        scrollHint={philosophy.hint}
      >
        <div
          className="flex flex-col items-center justify-center gap-4 sm:gap-7 max-w-4xl mx-auto px-4 sm:px-6 select-none"
          style={{ fontFamily: "var(--font-josefin), 'Josefin Sans', sans-serif" }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ember/30 bg-ember/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-ember shadow-[0_0_8px_#A02A22]" />
            <span className="text-ember text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase">
              {philosophy.label}
            </span>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-[1.35] sm:leading-[1.4] tracking-tight text-center max-w-3xl drop-shadow-lg">
            {philosophy.statement}
          </p>
        </div>
      </ScrollExpandMedia>
    </section>
  );
}
