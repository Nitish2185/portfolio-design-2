import CameraIntro from "./components/CameraIntro";
import CameraOverlays from "./components/CameraOverlays";
import DesignGrid from "./components/DesignGrid";
import ExperienceSection from "./components/ExperienceSection";
import Footer from "./components/Footer";
import Hud from "./components/Hud";
import Preloader from "./components/Preloader";
import ScanSection from "./components/ScanSection";
import WorkSection from "./components/WorkSection";
import useAnalogExperience from "./hooks/useAnalogExperience";

/**
 * Two stacked layers share one scroll: a layer behind the WebGL canvas
 * (title, part labels, scan section) and the main content in front of it.
 * Matching spacer heights keep both layers aligned.
 */
export default function App() {
  useAnalogExperience();

  return (
    <>
      <div id="scroll-container" className="h-[100dvh] overflow-y-scroll relative">
        <div id="scroll-content" className="relative">
          <div data-scrollable-content="" className="blocked">
            <DesignGrid />
            <Hud />

            {/* Behind the canvas */}
            <div className="absolute w-full z-[5] px-[calc(var(--s)*20)]">
              <div className="h-[700vh] p-[calc(var(--s)*20)] relative flex flex-col">
                <CameraIntro behind />
              </div>
              <div className="h-[100vh]" />
              <ExperienceSection behind />
              <div className="h-[300dvh] md:h-[400dvh]" />
              <ScanSection />
            </div>

            {/* In front of the canvas */}
            <main id="content" className="relative z-[19]">
              <section
                id="section-camera"
                className="h-[700vh] p-[calc(var(--s)*20)] relative flex flex-col"
              >
                <div
                  id="camera-section-mask"
                  className="absolute top-0 left-0 w-full h-[calc(100%+100dvh)] bg-dark1 invisible"
                />
                <CameraIntro />
              </section>
              <CameraOverlays />
              <div className="h-[100vh]" />
              <ExperienceSection />
              <div
                id="film-scaler"
                className="fixed z-[-1] w-[30vw] lg:w-[40vw] top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] pointer-events-none invisible"
              />
              <WorkSection />
              {/* Room for the scan section playing behind the canvas */}
              <div className="w-full h-[calc((5/4)*(4*var(--scan-element-height)+2*var(--scan-padding-y)-20dvh))] relative" />
              <Footer />
            </main>

            <canvas id="webgl" className="z-10" />
          </div>
        </div>
      </div>
      <Preloader />
    </>
  );
}
