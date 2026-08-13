/**
 * Fallback 2D murni CSS untuk mobile/tablet (tanpa Canvas sama sekali).
 * Meniru energi scene 3D: shard geometris melayang + glow merah + strip diagonal.
 */
const SHARDS = [
  { size: 90, top: '12%', left: '8%', rotate: 18, delay: '0s', red: false },
  { size: 130, top: '22%', left: '78%', rotate: -12, delay: '0.8s', red: true },
  { size: 60, top: '55%', left: '14%', rotate: 25, delay: '1.6s', red: false },
  { size: 100, top: '68%', left: '70%', rotate: -20, delay: '0.4s', red: true },
  { size: 70, top: '40%', left: '55%', rotate: 8, delay: '2.2s', red: false },
  { size: 140, top: '78%', left: '30%', rotate: 14, delay: '1.2s', red: true },
]

export default function MobileFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* glow merah di tengah */}
      <div
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(220,20,60,0.28) 0%, rgba(220,20,60,0.06) 45%, transparent 70%)' }}
      />
      {/* strip diagonal */}
      <div className="diag-stripes absolute inset-0 opacity-70" />
      {/* teks raksasa watermark */}
      <div className="font-display text-stroke-red absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] text-[24vw] opacity-40">
        RZP
      </div>
      {/* shard melayang */}
      {SHARDS.map((s, i) => (
        <div
          key={i}
          className="shard absolute"
          style={{
            width: s.size,
            height: s.size * 1.35,
            top: s.top,
            left: s.left,
            border: s.red ? '3px solid #dc143c' : '2px solid rgba(245,242,238,0.35)',
            background: s.red ? 'rgba(220,20,60,0.12)' : 'rgba(255,255,255,0.03)',
            ['--r' as string]: `${s.rotate}deg`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  )
}
