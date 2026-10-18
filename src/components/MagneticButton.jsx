import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

const variants = {
  primary:
    "bg-ember text-white hover:bg-ember-bright border border-transparent shadow-[0_0_25px_rgba(160,42,34,0.4)]",
  outline: "bg-transparent text-white border border-white/20 hover:border-ember/50 hover:text-ember",
  ghost: "bg-white/5 text-white border border-transparent hover:bg-white/10",
};

/**
 * Button / link that leans toward the cursor; its label follows at half
 * strength and both spring back with an overshoot when the cursor leaves.
 */
export default function MagneticButton({
  children,
  className = "",
  href,
  type,
  onClick,
  strength = 0.35,
  variant = "primary",
}) {
  const buttonRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || "ontouchstart" in window) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power2.out" });
      gsap.to(labelRef.current, {
        x: dx * strength * 0.5,
        y: dy * strength * 0.5,
        duration: 0.4,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to([el, labelRef.current], { x: 0, y: 0, duration: 0.6, ease: "back.out(1.7)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  const classes = `relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-sm tracking-wide transition-colors duration-300 overflow-hidden cursor-pointer ${variants[variant]} ${className}`;
  const Tag = href ? "a" : "button";
  const isExternal = href?.startsWith("http");
  const props = href
    ? { href, target: isExternal ? "_blank" : undefined, rel: isExternal ? "noopener noreferrer" : undefined }
    : { type: type || "button", onClick };

  return (
    <Tag ref={buttonRef} className={classes} data-magnetic="true" {...props}>
      <span ref={labelRef} className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Tag>
  );
}
