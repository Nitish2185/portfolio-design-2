import { scanSteps } from "../data/profile";

/**
 * Sits behind the canvas. #scan-element is an invisible placeholder the WebGL
 * plane tracks; the sticky labels name each stage the scan shader reveals.
 */
export default function ScanSection() {
  return (
    <section
      id="section-scan"
      className="w-full h-[calc((5/4)*(4*var(--scan-element-height)+2*var(--scan-padding-y)-20dvh))] relative"
    >
      <div className="w-full h-[100dvh] flex justify-center items-center sticky top-0 z-20">
        <div className="w-full design-grid px-[var(--grid-gap)]">
          <div
            id="scan-element"
            className="col-start-2 col-end-12 md:col-start-4 md:col-end-10 aspect-[3/2]"
          />
        </div>
        <div className="absolute left-0 bottom-0 w-full h-[var(--scan-padding-y)] bg-dark1" />
      </div>

      <div id="scan-steps" className="h-[100%] w-full absolute top-0 z-10">
        <div className="h-[calc((100%-100dvh)*0.2)]" />
        <div className="h-[calc((100%-100dvh)*0.8+100dvh)] flex flex-col py-[var(--scan-padding-y)] relative">
          <div className="sticky top-[var(--scan-padding-y)] w-full z-50">
            <div
              id="scan-data-mask"
              className="absolute top-0 left-0 w-[calc(2*var(--column-width)+3*var(--grid-gap))] bg-dark1 z-50 h-[var(--scan-element-height)] origin-top invisible md:visible"
            />
          </div>
          {scanSteps.map((step) => (
            <div
              key={step}
              className="flex-1 top-[var(--scan-padding-y)] sticky w-full px-[var(--grid-gap)] text-body text-orange1 flex flex-col z-10"
            >
              <div className="flex-1 md:hidden" />
              <div className="design-grid w-full">
                <p className="col-start-2 col-end-13 md:col-end-4 font-inter font-semibold capitalize bg-dark1 relative">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
