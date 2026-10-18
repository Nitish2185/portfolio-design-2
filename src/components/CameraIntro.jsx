import { intro, profile, topCoverParts } from "../data/profile";

function PartLabel({ part, lineFirst, behind }) {
  const line = <span className="block border-b border-dashed border-dark2 flex-1 h-[1px]" />;
  return (
    <span
      data-top-cover-part={behind ? part.key : undefined}
      className="flex items-center capitalize w-full opacity-0 transition-opacity duration-300 gap-[calc(var(--s)*20)]"
    >
      {lineFirst && line}
      <span className="block">{part.label}</span>
      {!lineFirst && line}
    </span>
  );
}

function IntroParagraph({ text, className, behind }) {
  return (
    <div
      className={`text-body text-light1 row-start-1 row-end-2 relative ${className} ${
        behind ? "invisible" : ""
      }`}
      data-animation={behind ? undefined : "paragraph"}
    >
      <p className="w-full sm:absolute top-0 left-0" aria-label={behind ? undefined : text}>
        {text}
      </p>
    </div>
  );
}

const labelColumn = "text-sm text-orange1 row-start-1 row-end-2 font-inter font-semibold";

/**
 * The hero is rendered twice, as in the original:
 *  - behind the canvas: the animated name and the part labels whose scroll
 *    position drives the camera's top cover lifting off;
 *  - in front of the canvas: the readable intro paragraphs.
 */
export default function CameraIntro({ behind = false }) {
  const [pentaprism, focusScreen, focusScreenBox] = topCoverParts;
  const name = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="h-[450vh]">
      <div className="h-[250vh]">
        <div className="pt-[calc(var(--s)*100)] flex-1">
          {behind ? (
            <span
              className="uppercase w-full font-bold text-[10.7vw] md:text-[11.4vw] leading-[100%] tracking-tighter flex justify-between text-white whitespace-nowrap"
              data-animation="title"
              aria-label={name}
            >
              {name}
            </span>
          ) : (
            <span className="uppercase w-full font-bold text-[10.55vw] leading-[100%] flex justify-between opacity-0 whitespace-nowrap">
              <span className="block">{profile.firstName}</span>
              <span className="block">{profile.lastName}</span>
            </span>
          )}

          <div className="mt-mobile-hero-offset mt-[30vmax]">
            <div
              className="flex flex-col gap-[calc(var(--s)*300)] md:gap-[calc(var(--s)*400)]"
              data-top-cover-parts-section={behind ? "true" : undefined}
            >
              <div className="design-grid w-full">
                <IntroParagraph
                  text={intro[0]}
                  behind={behind}
                  className="col-start-2 col-end-6 md:col-end-4"
                />
                <div className={`${labelColumn} col-start-7 col-end-13 md:col-end-12`}>
                  <PartLabel part={pentaprism} lineFirst behind={behind} />
                </div>
              </div>

              <div className="design-grid w-full mt-[calc(var(--s)*100)]">
                <IntroParagraph
                  text={intro[1]}
                  behind={behind}
                  className="col-start-8 md:col-start-10 col-end-13 md:col-end-12 mt-[calc(var(--s)*64)] md:mt-0"
                />
                <div className={`${labelColumn} col-start-1 md:col-start-2 col-end-7`}>
                  <PartLabel part={focusScreen} behind={behind} />
                </div>
              </div>

              <div className="design-grid w-full">
                <div className={`${labelColumn} col-start-1 md:col-start-2 col-end-7`}>
                  <PartLabel part={focusScreenBox} behind={behind} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
