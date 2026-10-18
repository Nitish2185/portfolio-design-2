import { useEffect, useState } from "react";
import { projects } from "../data/profile";

// Grid placement per card, mirroring the original layout. Cards 2 and 4 are desktop only.
const placements = [
  "col-start-1 md:col-start-3",
  "col-start-4 hidden md:block",
  "col-start-3 md:col-start-5",
  "col-start-6 hidden md:block",
  "col-start-5 md:col-start-7",
  "col-start-7 md:col-start-8",
  "col-start-9",
  "col-start-11 md:col-start-10",
];

/**
 * Skewed project frames that slide in one after another while the section
 * is pinned (see webgl/WorkCardsScroll.js). Once every card is shown they
 * pop up on hover, or on tap for touch devices.
 */
export default function WorkSection() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const clear = (e) => {
      if (!e.target.closest(".film-layer-card")) setActive(null);
    };
    document.addEventListener("click", clear);
    return () => document.removeEventListener("click", clear);
  }, []);

  return (
    <section
      id="section-film-layers"
      className="px-[var(--grid-gap)] h-[300dvh] md:h-[400dvh] relative"
    >
      <div className="w-full h-[100dvh] flex flex-col justify-center sticky top-0">
        <div className="film-layers-grid w-full design-grid">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className={`film-layer-card col-span-2 md:col-span-1 ${placements[i]} ${
                active === i ? "is-active" : ""
              }`}
              onClick={() => setActive((current) => (current === i ? null : i))}
            >
              <div className="w-full h-[calc(2*var(--column-width)*tan(45)+4*var(--column-width)*2/3)] md:h-[calc(var(--column-width)*tan(45)+var(--column-width)*2/3)]">
                <div
                  className="w-full aspect-[3/2] -skew-y-[45deg] origin-top-right scale-y-[2] opacity-0"
                  data-layer-image=""
                >
                  <img src={project.image} alt={project.title} className="block" />
                </div>
              </div>
              <div data-layer-text="" className="flex flex-col items-center opacity-0">
                <div className="film-layer-leader h-[calc(var(--s)*96)] border-l border-dashed border-dark2 w-0" />
                <p className="text-sm text-orange1 text-center mt-[calc(var(--s)*16)] font-inter font-semibold capitalize">
                  <a href={project.href} target="_blank" rel="noopener noreferrer">
                    {project.title}
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
