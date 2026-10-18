import { useEffect, useState } from "react";

// Debug overlay of the 12 column grid — press "g" to toggle.
export default function DesignGrid() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "g") setVisible((v) => !v);
    };
    window.addEventListener("keypress", onKey);
    return () => window.removeEventListener("keypress", onKey);
  }, []);

  return (
    <div
      className={`fixed w-full h-full z-50 design-grid px-[var(--grid-gap)] pointer-events-none ${
        visible ? "visible" : "invisible"
      }`}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="border-x border-dark2/50 h-full" />
      ))}
    </div>
  );
}
