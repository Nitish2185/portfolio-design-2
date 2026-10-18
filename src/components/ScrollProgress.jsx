import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

// Thin ember bar across the top that fills with page scroll
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const tween = gsap.to(barRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={barRef} className="scroll-progress" style={{ transform: "scaleX(0)" }} aria-hidden="true" />
  );
}
