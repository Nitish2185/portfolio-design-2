import { experienceIntro, experienceTable, workIntro } from "../data/profile";

function Paragraph({ text, className = "", behind }) {
  return (
    <div
      className={className}
      data-animation={behind ? undefined : "paragraph"}
      data-animation-threshold="-100px"
    >
      <p aria-label={behind ? undefined : text}>{text}</p>
    </div>
  );
}

function Line({ className }) {
  return <div className={`absolute left-0 w-full h-[1px] bg-dark2 ${className}`} />;
}

/**
 * Text that scrolls past the spiralling film strip. A hidden copy is
 * rendered behind the canvas purely to keep both layers the same height.
 */
export default function ExperienceSection({ behind = false }) {
  return (
    <section id={behind ? undefined : "section-film"} className="px-[var(--grid-gap)]">
      <div
        className={`design-grid text-body text-light1 h-full pb-[10vmax] gap-y-[calc(var(--s)*120)] md:gap-y-0 ${
          behind ? "invisible" : "visible"
        }`}
      >
        <Paragraph
          behind={behind}
          text={experienceIntro[0]}
          className="md:col-start-2 md:col-end-5 col-start-1 col-end-7 row-start-1"
        />

        <div className="col-start-7 col-end-13 md:col-start-9 md:col-end-12 row-start-2">
          <div className="flex flex-col gap-[calc(var(--s)*60)]">
            <Paragraph behind={behind} text={experienceIntro[1]} />

            <div className="flex flex-col text-sm">
              <div className="grid grid-cols-5 py-[calc(var(--s)*20)] font-semibold font-inter">
                <p className="col-start-2 col-end-5">{experienceTable.heading}</p>
                <p className="col-start-5 col-end-6 justify-self-end">{experienceTable.valueHeading}</p>
              </div>
              <div className="relative">
                <Line className="top-0" />
                {experienceTable.rows.map((row, i) => (
                  <div
                    key={row.title}
                    className="services-row relative py-[calc(var(--s)*20)] grid grid-cols-5 items-center"
                  >
                    <p className="text-sm col-start-1 col-end-2 text-dark2">
                      {String(i + 1).padStart(2, "0")}.
                    </p>
                    <p className="col-start-2 col-end-5">{row.title}</p>
                    <p className="col-start-5 col-end-6 justify-self-end">{row.value}</p>
                    <Line className="bottom-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Paragraph
          behind={behind}
          text={workIntro}
          className="col-start-1 col-end-7 md:col-start-2 md:col-end-5 row-start-3 md:row-start-2 md:mt-[30vmax]"
        />
      </div>
    </section>
  );
}
