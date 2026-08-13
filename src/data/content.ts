export interface SectionMeta {
  id: 'hero' | 'about' | 'projects' | 'contact'
  label: string
  short: string
}

export interface Project {
  index: string
  title: string
  year: string
  tagline: string
  tags: string[]
  description: string
}

export interface Stat {
  value: string
  label: string
}

export const SECTIONS: SectionMeta[] = [
  { id: 'hero', label: 'HOME', short: '01' },
  { id: 'about', label: 'ABOUT', short: '02' },
  { id: 'projects', label: 'PROJECTS', short: '03' },
  { id: 'contact', label: 'CONTACT', short: '04' },
]

export const PROFILE = {
  name: 'RYUUXYII',
  firstName: 'RYUU',
  lastName: 'XYII',
  role: 'CREATIVE FRONTEND ENGINEER',
  location: 'JAKARTA, INDONESIA',
  email: 'halo@ryuuxyii.dev',
  bio: [
    'Frontend engineer dengan obsesi pada detail dan energi visual. Enam tahun membangun web — dari landing page marketing hingga aplikasi real-time — dengan fokus pada interaksi yang terasa hidup: animasi kinetik, WebGL, dan storytelling lewat interface.',
    'Di luar jam kerja, saya main synthesizer, bikin game jam solo, dan ngumpulin font display. Prinsip saya sederhana: kalau interaksinya tidak bikin orang menoleh, berarti belum selesai.',
  ],
  skills: [
    'React',
    'TypeScript',
    'Three.js / R3F',
    'WebGL Shaders',
    'GSAP',
    'Tailwind CSS',
    'Zustand',
    'Node.js',
    'Creative Coding',
    'UI Engineering',
    'Design Systems',
    'Motion Design',
  ],
  stats: [
    { value: '06+', label: 'TAHUN PENGALAMAN' },
    { value: '24', label: 'PROYEK SHIPPED' },
    { value: '12', label: 'NEGARA KLIEN' },
    { value: '99', label: 'AVG. LIGHTHOUSE' },
  ] as Stat[],
  socials: [
    { label: 'GITHUB', handle: '@ryuuxyii', href: 'https://github.com/ryuuxyii' },
    { label: 'LINKEDIN', handle: '/in/ryuuxyii', href: 'https://linkedin.com/in/ryuuxyii' },
    { label: 'X / TWITTER', handle: '@ryuuxyii', href: 'https://x.com/ryuuxyii' },
    { label: 'DRIBBBLE', handle: '/ryuuxyii', href: 'https://dribbble.com/ryuuxyii' },
  ],
}

export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'NEON DRIFT',
    year: '2026',
    tagline: 'Endless runner synthwave di browser',
    tags: ['Three.js', 'WebGL', 'GSAP'],
    description:
      'Game arcade endless runner dengan scene neon, partikel kaskade, dan scoring berbasis timing. Optimasi draw call sampai 60fps stabil di laptop kelas menengah.',
  },
  {
    index: '02',
    title: 'AURALIS',
    year: '2025',
    tagline: 'Visualizer musik interaktif real-time',
    tags: ['React', 'Web Audio API', 'R3F'],
    description:
      'Visualizer yang membaca spektrum audio live — mesh bereaksi terhadap bass dan hi-hat. Dipakai DJ lokal untuk VJ set live di beberapa venue Jakarta.',
  },
  {
    index: '03',
    title: 'KOPI NUSANTARA',
    year: '2025',
    tagline: 'E-commerce kopi lokal + peta roastery',
    tags: ['Next.js', 'Tailwind', 'Stripe'],
    description:
      'Toko online roastery dengan katalog 40+ biji kopi, subscription langganan, dan peta interaktif penjual. Konversi checkout naik 34% setelah redesign animasi mikro.',
  },
  {
    index: '04',
    title: 'PULSEBOARD',
    year: '2024',
    tagline: 'Dashboard analitik real-time',
    tags: ['TypeScript', 'D3.js', 'Zustand'],
    description:
      'Dashboard monitoring untuk tim produk: streaming metrics WebSocket, chart live, dan alert board. Menangani 5k event/detik dengan virtualisasi DOM.',
  },
]
