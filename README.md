# Persona Portfolio — 3D Interactive Portfolio

Portofolio 3D interaktif bergaya **UI game Persona 5** — *bukan replika aset asli*, tapi terinspirasi dari bahasa desainnya: transisi tajam, tipografi miring bold, palet merah–hitam–putih, dan energi "menyerang" di setiap interaksi.

## Cara Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
```

Build produksi & preview:

```bash
npm run build    # typecheck (tsc) + vite build
npm run preview
```

## Stack

| Lapisan | Teknologi |
|---|---|
| 3D Scene | React Three Fiber + Drei |
| Post-processing | @react-three/postprocessing (Bloom + Vignette) |
| Animasi | GSAP + ScrollTrigger (semua non-3D + transisi kamera) |
| State | Zustand (section aktif, progress scroll, kamera) |
| Styling | Tailwind CSS |
| Build | Vite + React + TypeScript (strict mode) |

## Pengalaman

Satu scene 3D — **bukan halaman scroll biasa**. Kamera bergerak sepanjang `CatmullRomCurve3` yang melewati 4 titik, satu per section (Hero → About → Projects → Contact). Scroll (atau klik navigasi) memetakan progress ke kurva dengan easing per-segment, jadi perpindahan selalu sinematik.

## Struktur Folder

```
src/
├── components/
│   ├── 3d/                 # Semua scene WebGL
│   │   ├── Scene.tsx       # Canvas + bloom + fog + lights
│   │   ├── CameraRig.tsx   # Kamera di sepanjang CatmullRomCurve3
│   │   ├── FloatingPanels.tsx  # Panel geometris melayang (custom shader)
│   │   ├── ProjectCards3D.tsx   # Kartu proyek 3D + parallax tilt
│   │   ├── Shaders.ts      # Semua GLSL: panel, ground grid, kartu
│   │   └── MobileFallback.tsx   # Fallback 2D CSS untuk mobile
│   └── ui/
│       ├── CustomCursor.tsx     # Cursor + trail + label hover
│       ├── NavBar.tsx           # Navigasi dengan slash merah
│       ├── SectionSweep.tsx     # Transisi clip-path merah-hitam
│       ├── ImpactButton.tsx     # Tombol micro-interaction "impact"
│       └── sections/            # Overlay 2D per section
├── hooks/
│   ├── useDeviceDetect.ts       # Deteksi mobile/tablet
│   └── useSectionScroll.ts      # ScrollTrigger → store + animasi overlay
├── store/useStore.ts            # Zustand: progress, section aktif, sweep
├── data/content.ts              # ✏️ SEMUA konten portofolio di sini
└── lib/                         # util kecil (cn, PRNG deterministik)
```

## Kustomisasi Konten

Semua teks — nama, bio, skill, proyek, social link — ada di **`src/data/content.ts`**. Ganti nama folder/repo, ganti isinya, dan selesai.

- Warna: `tailwind.config.js` → `colors.persona`
- Titik kamera tiap section: `src/components/3d/CameraRig.tsx` (`CAMERA_POINTS` / `LOOK_POINTS`)
- Posisi kartu 3D: `src/components/3d/ProjectCards3D.tsx` (`CARD_POSITIONS`)
- Shader panel/kartu: `src/components/3d/Shaders.ts`

## Catatan Teknis

- **Lazy loading**: seluruh bundle three.js dipisah via `React.lazy` dan hanya dimuat saat dibutuhkan.
- **Mobile**: deteksi `pointer: coarse` → Canvas tidak dimuat, diganti fallback 2D CSS (hemat baterai/GPU).
- **Performance**: animasi per-frame 3D memakai ref + `useFrame`, bukan React state (nol re-render per frame). State store dibaca transien di dalam loop.
- **Font 3D**: label di kartu 3D memakai font default troika (dimuat runtime dari CDN). Jika offline, label 3D tidak tampil — kartu tetap terlihat.
- **StrictMode**: GSAP ScrollTrigger dibuat & di-kill lewat efek, aman untuk double-mount di dev.

## Disclaimer

Bukan afiliasi Atlus / P-Studio. Gaya visual terinspirasi, seluruh aset (shader, geometri, tipografi) dibuat sendiri.
