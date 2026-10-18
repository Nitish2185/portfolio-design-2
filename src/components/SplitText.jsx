import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, span: motion.span, div: motion.div };

/**
 * Heading split into characters (or words) that rise in one after another
 * whenever it scrolls into view, and reset when it leaves.
 */
export default function SplitText({
  text,
  className = "",
  delay = 35,
  duration = 0.55,
  ease = [0.22, 1, 0.36, 1],
  splitType = "chars",
  animationFrom = { opacity: 0, y: 40 },
  animationTo = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-50px",
  textAlign,
  style,
  tag = "h2",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: threshold, margin: rootMargin });
  const Tag = tags[tag] || tags.h2;
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <Tag
      ref={ref}
      className={`inline-block select-none ${className}`}
      style={{ ...style, textAlign, wordWrap: "break-word" }}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline">
        {words.map((word, w) => {
          const isLast = w === words.length - 1;
          const space = !isLast && <span className="inline-block">&nbsp;</span>;

          if (splitType === "words") {
            return (
              <span key={w} className="inline-block whitespace-nowrap overflow-hidden py-1">
                <motion.span
                  className="inline-block"
                  initial={animationFrom}
                  animate={inView ? animationTo : animationFrom}
                  transition={{ duration, delay: (w * delay) / 1000, ease }}
                >
                  {word}
                </motion.span>
                {space}
              </span>
            );
          }

          return (
            <span key={w} className="inline-block whitespace-nowrap overflow-hidden py-1">
              {Array.from(word).map((char, c) => {
                const index = charIndex++;
                return (
                  <motion.span
                    key={c}
                    className="inline-block transform-gpu will-change-transform"
                    initial={animationFrom}
                    animate={inView ? animationTo : animationFrom}
                    transition={{ duration, delay: (index * delay) / 1000, ease }}
                  >
                    {char}
                  </motion.span>
                );
              })}
              {space}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
