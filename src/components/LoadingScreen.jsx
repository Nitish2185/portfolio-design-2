import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { profile } from "../data/profile";

/**
 * Counts 0 → 100 while the bar fills, then the counter and name lift away
 * and the whole screen slides up like a curtain.
 */
export default function LoadingScreen({ onComplete }) {
  const screenRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const exit = () =>
        gsap
          .timeline({ onComplete })
          .to(counterRef.current, { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" })
          .to(nameRef.current, { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }, "<0.1")
          .to(barRef.current?.parentElement, { opacity: 0, duration: 0.3 }, "<0.1")
          .to(screenRef.current, { yPercent: -100, duration: 1, ease: "expo.inOut" });

      const progress = { value: 0 };
      const tl = gsap.timeline({ onComplete: exit });
      tl.to(progress, {
        value: 100,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => {
          // Refs are already detached when the context reverts on unmount
          const value = Math.round(progress.value);
          if (counterRef.current) counterRef.current.textContent = String(value);
          if (barRef.current) barRef.current.style.transform = `scaleX(${value / 100})`;
        },
      });
      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        0.5,
      );
    });
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={screenRef} className="loading-screen">
      <span ref={counterRef} className="loading-counter">
        0
      </span>
      <div ref={nameRef} className="opacity-0">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "var(--ash)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          {profile.shortName}
        </span>
      </div>
      <div className="loading-bar-track">
        <div ref={barRef} className="loading-bar-fill" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
