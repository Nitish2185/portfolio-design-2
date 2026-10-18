import { useCallback, useEffect, useRef } from "react";

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Sticky stage whose media starts as a small rounded, blurred, zoomed-in
 * window and opens to full bleed as you scroll. The title and hint fade
 * away early; the overlay content fades up near the end.
 */
export default function ScrollExpandMedia({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "The Philosophy",
  scrollHint = "Scroll to expand",
  startWidth = 48,
  startHeight = 60,
  startRadius = 26,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1,
  overlayScrim = 0.72,
  children,
  className = "",
  style,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const hintRef = useRef(null);
  const scrimRef = useRef(null);
  const overlayRef = useRef(null);

  const apply = useCallback(
    (progress) => {
      const frame = frameRef.current;
      const media = mediaRef.current;
      if (!frame || !media) return;

      const isPhone = window.innerWidth < 640;
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
      const w0 = isPhone ? 86 : isTablet ? 70 : startWidth;
      const h0 = isPhone ? 58 : isTablet ? 60 : startHeight;
      const r0 = isPhone ? 18 : isTablet ? 22 : startRadius;

      const p = clamp(progress / 0.85, 0, 1);
      const eased = smoothstep(0, 1, p);
      const insetX = Math.max(0, (100 - (w0 + (100 - w0) * eased)) / 2);
      const insetY = Math.max(0, (100 - (h0 + (100 - h0) * eased)) / 2);
      const radius = r0 + (endRadius - r0) * eased;
      frame.style.clipPath = `inset(${insetY.toFixed(3)}% ${insetX.toFixed(3)}% ${insetY.toFixed(3)}% ${insetX.toFixed(3)}% round ${radius.toFixed(1)}px)`;

      const zoom = mediaZoom + (1 - mediaZoom) * eased;
      media.style.transform = `scale(${zoom.toFixed(4)})`;
      media.style.filter = `blur(${(8 * (1 - eased)).toFixed(1)}px)`;

      if (titleRef.current) {
        const t = smoothstep(0.08, 0.5, p);
        titleRef.current.style.opacity = (1 - t).toFixed(3);
        titleRef.current.style.transform = `translate3d(0, ${(-26 * t).toFixed(1)}px, 0) scale(${(1 + 0.04 * t).toFixed(3)})`;
      }
      if (hintRef.current) {
        const t = smoothstep(0, 0.2, p);
        hintRef.current.style.opacity = (1 - t).toFixed(3);
        hintRef.current.style.transform = `translate3d(0, ${(10 * t).toFixed(1)}px, 0)`;
      }
      if (scrimRef.current) {
        scrimRef.current.style.opacity = (0.25 + (overlayScrim - 0.25) * eased).toFixed(3);
      }
      if (overlayRef.current) {
        const t = smoothstep(0.45, 0.85, progress);
        overlayRef.current.style.opacity = t.toFixed(3);
        overlayRef.current.style.transform = `translate3d(0, ${(20 * (1 - t)).toFixed(1)}px, 0)`;
        overlayRef.current.style.pointerEvents = t > 0.8 ? "auto" : "none";
      }
    },
    [startWidth, startHeight, startRadius, endRadius, mediaZoom, overlayScrim],
  );

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    let frame = 0;
    let travel = 0;

    const measure = () => {
      const vh = window.innerHeight;
      if (vh <= 0) return;
      const trackHeight = vh * (1 + Math.max(0.6, scrollDistance));
      track.style.height = `${trackHeight}px`;
      stage.style.height = `${vh}px`;
      travel = trackHeight - vh;
    };
    const update = () => apply(travel <= 0 ? 0 : clamp(-track.getBoundingClientRect().top / travel, 0, 1));
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [apply, scrollDistance]);

  let media;
  if (mediaType === "video") {
    media = (
      <video ref={mediaRef} className="scroll-expand__media" src={src} poster={poster} autoPlay muted loop playsInline />
    );
  } else if (src) {
    media = <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />;
  } else {
    media = <div ref={mediaRef} className="scroll-expand__media bg-void" />;
  }

  return (
    <div ref={rootRef} className={`scroll-expand ${className}`.trim()} style={style}>
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <h2 ref={titleRef} className="scroll-expand__title">
              {title}
            </h2>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              <span className="scroll-expand__hint-dot" />
              <span>{scrollHint}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
