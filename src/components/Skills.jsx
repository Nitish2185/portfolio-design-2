import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { codingProfiles, skills, skillsIntro } from "../data/profile";

const josefin = { fontFamily: "var(--font-josefin), 'Josefin Sans', sans-serif" };

function ProfileHeader({ icon, name, handle, href }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <img src={icon} alt="" className="w-4 h-4 object-contain" />
        </span>
        <div className="min-w-0">
          <p className="text-white font-bold text-lg leading-tight">{name}</p>
          <p className="text-xs text-ash font-mono truncate">@{handle}</p>
        </div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-ash hover:text-ember transition-colors font-semibold uppercase tracking-wider shrink-0"
      >
        View ↗
      </a>
    </div>
  );
}

// Big number that counts up from 0 when the section scrolls in
function Counter({ value, label }) {
  return (
    <div>
      <span
        data-count={value}
        className="block text-5xl sm:text-6xl font-bold text-white tracking-tight leading-none"
        style={{ fontFamily: "var(--font-display)" }}
      >
        0
      </span>
      <span className="block mt-2 text-[11px] text-ash uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef(null);
  const { leetcode, codechef, github } = codingProfiles;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" };

      gsap.fromTo(
        ".skills-animate",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: trigger },
      );

      gsap.utils.toArray("[data-count]").forEach((el) => {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: Number(el.dataset.count),
          duration: 2,
          ease: "power2.inOut",
          scrollTrigger: trigger,
          onUpdate: () => {
            el.textContent = String(Math.round(counter.value));
          },
        });
      });

      gsap.fromTo(
        "[data-bar]",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, stagger: 0.12, ease: "expo.out", delay: 0.3, scrollTrigger: trigger },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative py-16 sm:py-24 md:py-40 overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-iron to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-0 w-[70vw] max-w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none blur-[150px]"
        style={{ backgroundColor: "var(--ember)" }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10 px-4 sm:px-6 md:px-8">
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-ember inline-block rounded-full" />
            <span className="text-ember text-xs font-bold tracking-[0.25em] uppercase">{skillsIntro.label}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            {skillsIntro.title}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-ash max-w-xl leading-relaxed font-normal">
            {skillsIntro.subtitle}
          </p>
        </div>

        {/* Coding profiles: solved questions only */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="skills-animate glass-card p-5 sm:p-8 lg:col-span-6">
            <ProfileHeader
              icon="https://cdn.simpleicons.org/leetcode/ffffff"
              name="LeetCode"
              handle={leetcode.handle}
              href={leetcode.href}
            />
            <Counter value={leetcode.solved} label="Questions solved" />
            <div className="mt-6 space-y-4">
              {leetcode.breakdown.map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold" style={{ color: d.color }}>
                      {d.label}
                    </span>
                    <span className="text-ash font-mono">
                      <span className="text-white font-semibold">{d.solved}</span> / {d.total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      data-bar=""
                      className="h-full rounded-full origin-left"
                      style={{
                        width: `${Math.max(2, (d.solved / leetcode.solved) * 100)}%`,
                        background: d.color,
                        boxShadow: `0 0 12px ${d.color}66`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="skills-animate glass-card p-5 sm:p-8 lg:col-span-3 flex flex-col justify-between">
            <ProfileHeader
              icon="https://cdn.simpleicons.org/codechef/ffffff"
              name="CodeChef"
              handle={codechef.handle}
              href={codechef.href}
            />
            <Counter value={codechef.solved} label="Problems solved" />
          </div>

          <div className="skills-animate glass-card p-5 sm:p-8 lg:col-span-3 flex flex-col justify-between">
            <ProfileHeader
              icon="https://cdn.simpleicons.org/github/ffffff"
              name="GitHub"
              handle={github.handle}
              href={github.href}
            />
            <Counter value={github.repos} label="Public repositories" />
          </div>
        </div>

        <div className="skills-animate glass-card p-5 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {skills.map((s) => (
              <div key={s.group}>
                <p className="text-[11px] text-ember uppercase tracking-wider mb-3 font-semibold">{s.group}</p>
                <div className="flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider text-white uppercase bg-white/[0.06] border border-white/15 hover:border-ember/50 hover:text-ember transition-colors"
                      style={josefin}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[11px] text-ash/70 text-right font-mono">Stats as of {codingProfiles.updated}</p>
      </div>
    </section>
  );
}
