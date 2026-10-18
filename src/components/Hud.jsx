import { useEffect, useRef } from "react";

const PIN_COUNT = 41;

function Corner({ className }) {
  return (
    <div
      className={`border-dark2 h-[calc(var(--s)*32)] w-[calc(var(--s)*32)] absolute ${className}`}
    />
  );
}

function formatElapsed(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

// Viewfinder-style overlay: fps / resolution / recording timer and the scroll ruler.
// Values are written straight to the DOM every frame so React never re-renders.
export default function Hud() {
  const fpsRef = useRef(null);
  const resolutionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const perf = { count: 0, lastTime: 0 };
    let frame;

    const setResolution = () => {
      resolutionRef.current.textContent = `${window.innerWidth}x${window.innerHeight}`;
    };
    setResolution();
    window.addEventListener("resize", setResolution);

    const tick = () => {
      const now = performance.now();
      perf.count++;
      if (now - perf.lastTime > 1000) {
        fpsRef.current.textContent = `${Math.round((perf.count * 1000) / (now - perf.lastTime))}fps`;
        perf.count = 0;
        perf.lastTime = now;
      }
      timerRef.current.textContent = formatElapsed(now - start);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", setResolution);
    };
  }, []);

  return (
    <div className="fixed inset-0 p-[calc(var(--s)*20)] z-[100] pointer-events-none font-inter">
      <div className="w-full h-full relative p-[calc(var(--s)*16)] text-sm lg:text-xsm text-dark2 flex justify-between items-start">
        <div>
          <p ref={fpsRef}>60fps</p>
          <p ref={resolutionRef} />
        </div>
        <div className="flex gap-[calc(var(--s)*8)] items-center">
          <div className="h-[calc(var(--s)*8)] w-[calc(var(--s)*8)] rounded-full bg-orange1" />
          <p ref={timerRef}>00:00:00</p>
        </div>

        <Corner className="border-t border-l top-0 left-0" />
        <Corner className="border-r border-t top-0 right-0" />
        <Corner className="border-l border-b bottom-0 left-0" />
        <Corner className="border-b border-r bottom-0 right-0" />

        <div
          id="scroller"
          className="absolute bottom-0 left-[50%] translate-x-[-50%] flex flex-col items-center gap-[calc(var(--s)*12)]"
        >
          <div className="w-full h-[calc(var(--s)*8)] relative">
            <div className="w-[calc(100%-var(--s)*8+2px)] absolute h-full top-0">
              <span
                id="scroller-cursor"
                className="block w-0 h-0 absolute left-0 translate-x-[-50%] top-0 border-l-[calc(var(--s)*4)] border-r-[calc(var(--s)*4)] border-t-[calc(var(--s)*8)] border-l-transparent border-r-transparent border-t-dark2 opacity-0"
              />
            </div>
          </div>
          <div className="flex items-end">
            {Array.from({ length: PIN_COUNT }, (_, i) => (
              <span
                key={i}
                data-scroller-pin=""
                className={`block w-[calc(var(--s)*8)] border-l border-dark2 opacity-0 ${
                  i % 10 === 0 ? "h-[calc(var(--s)*16)]" : "h-[calc(var(--s)*8)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
