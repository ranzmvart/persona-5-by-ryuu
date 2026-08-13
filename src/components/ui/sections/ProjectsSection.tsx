import { PROJECTS } from '../../../data/content'
import { scrollToSection } from '../../../hooks/useSectionScroll'

function ProjectRow({
  project,
  onOpen,
}: {
  project: (typeof PROJECTS)[number]
  onOpen: () => void
}) {
  return (
    <button
      data-hover
      data-hover-label="OPEN"
      onClick={onOpen}
      className="group relative block w-full border-b border-[#f5f2ee]/15 py-5 text-left transition-colors duration-200"
    >
      {/* sapuan merah saat hover — energi "menyerang" */}
      <span className="absolute inset-0 origin-left scale-y-0 bg-[#dc143c] transition-transform duration-200 ease-out group-hover:scale-y-100" />

      <div className="relative z-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 px-2 transition-colors duration-200 group-hover:text-[#0a0a0a]">
        <span className="font-display text-lg text-[#dc143c] transition-colors duration-200 group-hover:text-[#0a0a0a]">
          {project.index}
        </span>
        <span className="font-display -skew-x-6 text-2xl tracking-wide text-[#f5f2ee] transition-colors duration-200 group-hover:text-[#0a0a0a] md:text-4xl">
          {project.title}
        </span>
        <span className="font-body text-[11px] font-black uppercase tracking-[0.3em] text-[#f5f2ee]/50 transition-colors duration-200 group-hover:text-[#0a0a0a]/70">
          {project.year}
        </span>
        <span className="ml-auto hidden font-body text-xs font-bold uppercase tracking-widest text-[#f5f2ee]/60 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#0a0a0a] md:block">
          {project.tagline} →
        </span>
      </div>

      {/* tags */}
      <div className="relative z-10 mt-2 flex flex-wrap gap-2 px-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="border border-[#dc143c]/60 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-widest text-[#dc143c] transition-colors duration-200 group-hover:border-[#0a0a0a]/60 group-hover:text-[#0a0a0a]"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}

export default function ProjectsSection() {
  return (
    <section id="overlay-projects" className="absolute inset-0 z-10">
      <div data-section-content className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-6 md:px-12">
        <span className="font-display text-stroke-soft pointer-events-none absolute -right-2 top-0 text-[9rem] opacity-60 md:text-[15rem]">
          03
        </span>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display -skew-x-6 text-[13vw] leading-none text-[#f5f2ee] lg:text-[6rem]">
            PRO<span className="text-stroke-red">YEK</span>
          </h2>
          <p className="mb-2 max-w-xs font-body text-xs font-bold uppercase tracking-[0.25em] text-[#f5f2ee]/50">
            Pilihan proyek terpilih — kartu merah yang melayang di scene 3D di sebelah kiri.
          </p>
        </div>

        <div className="border-t border-[#f5f2ee]/15">
          {PROJECTS.map((project) => (
            <ProjectRow key={project.index} project={project} onOpen={() => scrollToSection(3)} />
          ))}
        </div>

        <p className="mt-6 flex items-center gap-3 font-body text-xs font-black uppercase tracking-[0.3em] text-[#f5f2ee]/50">
          <span className="h-[3px] w-12 -skew-x-12 bg-[#dc143c]" />
          Detail kasus studi lengkap di GitHub
        </p>
      </div>
    </section>
  )
}
