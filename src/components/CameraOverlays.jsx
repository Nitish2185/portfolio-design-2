import { cameraCta } from "../data/profile";

function Corner({ className }) {
  return (
    <div
      className={`border-dark2 h-[calc(var(--s)*32)] w-[calc(var(--s)*32)] absolute ${className}`}
    />
  );
}

/**
 * Fixed-position elements used by the Canon F-1 scene: the CTA that appears
 * once the lens is exploded, the size reference the model scales against,
 * and the bottom-right viewer that shows the hovered lens element.
 */
export default function CameraOverlays() {
  return (
    <>
      <div className="fixed w-full left-0 top-[20vh] md:top-[50vh] translate-y-[-50%]">
        <div
          className="design-grid w-full items-center opacity-0 transition-opacity duration-300 px-[var(--grid-gap)]"
          data-camera-cta-text=""
        >
          <div className="col-start-1 col-end-3 md:col-end-2 relative hidden md:block">
            <p className="text-sm text-light1">
              {cameraCta[0]}
              <br />
              {cameraCta[1]}
            </p>
          </div>
          <div className="col-start-3 md:col-start-2 md:col-end-4 col-end-6 h-0 border-b border-dashed border-dark2 hidden md:block" />
        </div>
      </div>

      <div
        className="fixed z-[-1] w-[25vw] md:w-[30vw] lg:w-[40vw] top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] pointer-events-none invisible"
        id="camera-scaler"
      />

      <div
        className="fixed bottom-[calc(var(--s)*20)] px-[var(--grid-gap)] design-grid w-full pointer-events-none opacity-0 transition-opacity duration-300"
        id="part-viewer-container"
      >
        <div className="text-sm pb-[calc(var(--s)*8)] col-start-1 col-end-6 md:col-start-10 md:col-end-13 pointer-events-auto">
          <p id="part-viewer-name" className="text-orange1 font-inter font-semibold capitalize" />
          <p id="part-viewer-description" className="text-sm text-light1 mt-[calc(var(--s)*12)]" />
        </div>
        <div className="col-start-8 md:col-start-10 col-end-13">
          <div id="part-viewer" className="aspect-square relative w-full min-w-full">
            <Corner className="border-t border-l top-0 left-0" />
            <Corner className="border-r border-t top-0 right-0" />
            <Corner className="border-l border-b bottom-0 left-0 hidden md:block" />
          </div>
        </div>
      </div>
    </>
  );
}
