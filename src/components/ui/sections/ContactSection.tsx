import ImpactButton from '../ImpactButton'
import { PROFILE } from '../../../data/content'

export default function ContactSection() {
  return (
    <section id="overlay-contact" className="absolute inset-0 z-10">
      <div data-section-content className="relative flex h-full flex-col justify-center px-6 md:px-12 lg:px-20">
        <span className="font-display text-stroke-soft pointer-events-none absolute -right-2 top-2 text-[9rem] opacity-60 md:text-[15rem]">
          04
        </span>

        <p className="mb-4 flex items-center gap-3 font-body text-xs font-black uppercase tracking-[0.4em] text-[#dc143c]">
          <span className="inline-block h-[3px] w-12 -skew-x-12 bg-[#dc143c]" />
          Punya proyek menarik?
        </p>

        <h2 className="font-display text-[16vw] leading-[0.9] text-[#f5f2ee] lg:text-[10rem]">
          <span className="block -skew-x-6">SAY</span>
          <span className="block">
            <span className="text-stroke-red">HI!</span>
          </span>
        </h2>

        {/* Email raksasa */}
        <a
          data-hover
          data-hover-label="MAIL"
          href={`mailto:${PROFILE.email}`}
          className="group mt-8 inline-block max-w-full"
        >
          <span className="font-display -skew-x-6 border-b-4 border-[#dc143c] pb-1 text-2xl tracking-wide text-[#f5f2ee] transition-colors duration-150 group-hover:bg-[#dc143c] group-hover:text-[#0a0a0a] md:text-4xl">
            {PROFILE.email}
          </span>
        </a>

        {/* Socials */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          {PROFILE.socials.map((social) => (
            <ImpactButton key={social.label} variant="ghost" hoverLabel="EXT" href={social.href} className="border-0 px-3 py-2 text-xs">
              {social.label}
            </ImpactButton>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#f5f2ee]/15 pt-5">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.25em] text-[#f5f2ee]/45">
            {PROFILE.location} — {PROFILE.role}
          </p>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.25em] text-[#f5f2ee]/45">
            © {new Date().getFullYear()} {PROFILE.name} — dibangun dengan React × Three × GSAP
          </p>
        </div>
      </div>
    </section>
  )
}
