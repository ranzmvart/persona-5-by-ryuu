import { PROFILE } from '../../../data/content'

export default function AboutSection() {
  return (
    <section id="overlay-about" className="absolute inset-0 z-10">
      <div data-section-content className="relative flex h-full flex-col justify-center px-6 md:px-12 lg:px-20">
        <span className="font-display text-stroke-soft pointer-events-none absolute -left-2 top-2 text-[9rem] opacity-60 md:text-[16rem]">
          02
        </span>

        <h2 className="font-display mb-10 text-[14vw] leading-none text-[#f5f2ee] lg:text-[7rem]">
          <span className="mr-4 inline-block -skew-x-12 bg-[#dc143c] px-3 text-[#0a0a0a]">
            TENTANG
          </span>
          <span className="-skew-x-6">SAYA</span>
        </h2>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Bio */}
          <div className="space-y-5">
            {PROFILE.bio.map((paragraph, i) => (
              <p key={i} className="font-body text-[15px] leading-relaxed text-[#f5f2ee]/70">
                {paragraph}
              </p>
            ))}
            <p className="flex items-center gap-3 font-body text-xs font-black uppercase tracking-[0.3em] text-[#f5f2ee]/50">
              <span className="h-[2px] w-10 -skew-x-12 bg-[#dc143c]" />
              {PROFILE.location}
            </p>
          </div>

          {/* Skill chips */}
          <div>
            <h3 className="mb-5 font-body text-xs font-black uppercase tracking-[0.35em] text-[#dc143c]">
              Toolbox
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {PROFILE.skills.map((skill) => (
                <span
                  key={skill}
                  data-hover
                  data-hover-label="SKILL"
                  className="border border-[#f5f2ee]/20 bg-[#161616] px-3.5 py-2 font-body text-xs font-bold uppercase tracking-widest text-[#f5f2ee]/85 transition-all duration-150 hover:-skew-x-6 hover:border-[#dc143c] hover:bg-[#dc143c] hover:text-[#0a0a0a]"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-px border border-[#f5f2ee]/15 bg-[#f5f2ee]/15 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {PROFILE.stats.map((stat) => (
                <div key={stat.label} className="bg-[#0a0a0a] p-4">
                  <p className="font-display text-3xl text-[#dc143c]">{stat.value}</p>
                  <p className="mt-1 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5f2ee]/55">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
