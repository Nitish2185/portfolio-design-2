import { footer, profile } from "../data/profile";

function Label({ children }) {
  return (
    <p className="text-orange1 uppercase tracking-wider text-[11px] font-semibold mb-1">
      {children}
    </p>
  );
}

function SocialLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-light1/60 hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

// Contact block. The film boxes and rolls that tumble in behind it are WebGL (webgl/PhysicsFooter.js).
export default function Footer() {
  const { github, linkedin, x } = profile.socials;
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="h-[100dvh] relative flex flex-col justify-end p-[calc(var(--s)*30)] md:p-[calc(var(--s)*50)] z-20 pointer-events-auto"
    >
      <div className="design-grid w-full pb-[calc(var(--s)*40)] md:pb-[calc(var(--s)*60)]">
        <div className="col-start-1 col-end-13 md:col-start-2 md:col-end-11 text-light1">
          <p className="text-xs uppercase tracking-[0.25em] text-orange1 font-inter font-semibold mb-3">
            {footer.eyebrow}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {footer.heading}
          </h2>
          <p className="footer-lede text-sm md:text-base text-light1/80 max-w-xl mb-6 leading-relaxed">
            {footer.lede}
          </p>

          <div className="footer-contacts grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-4 pb-6 border-t border-b border-dark2 text-xs md:text-sm font-inter">
            <div>
              <Label>Direct Contact</Label>
              <a
                href={`mailto:${profile.email}`}
                className="text-light1 hover:text-white transition-colors block font-medium break-all"
              >
                {profile.email}
              </a>
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-light1/60 hover:text-light1 transition-colors block mt-0.5"
              >
                Download résumé ↓
              </a>
            </div>
            <div>
              <Label>Based In</Label>
              <p className="text-light1 font-medium">{profile.location}</p>
              <p className="text-light1/60 mt-0.5">Remote &amp; on-site</p>
            </div>
            <div>
              <Label>Availability &amp; Social</Label>
              <p className="text-light1 font-medium">{footer.availability}</p>
              <div className="flex flex-wrap gap-x-3 mt-0.5">
                <SocialLink href={github.href}>GitHub</SocialLink>
                <SocialLink href={linkedin.href}>LinkedIn</SocialLink>
                <SocialLink href={x.href}>{x.label}</SocialLink>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-light1/50 pt-4 font-inter">
            <span>
              &copy; {year} {profile.fullName}. All rights reserved.
            </span>
            <span>{footer.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
