import * as THREE from 'three'

/**
 * ==== SHADER MATERIALS (Custom GLSL) ====
 * Semua panel/kartu/partikel pakai shader sendiri — geometri abstrak
 * ala UI Persona: sudut tajam, strip diagonal, glow merah, scanline,
 * noise "energi tidak stabil".
 *
 * Aturan performa: noise memakai value-noise 2D sederhana (2 oktaf),
 * tidak ada loop panjang di fragment shader.
 */

/* ------------------------------------------------------------------ */
/* 1. PANEL — noise + scanline vertikal + fresnel edge glow            */
/* ------------------------------------------------------------------ */

const panelVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const panelFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSeed;
  uniform float uOpacity;
  uniform float uScanSpeed;      // kecepatan scanline vertikal
  uniform float uGlowIntensity;  // intensitas glow keseluruhan
  uniform float uNoiseScale;     // skala noise (makin besar makin halus)
  uniform float uNoiseStrength;  // kekuatan noise
  uniform float uFresnelPower;   // kekuatan edge glow (fresnel)
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  // value-noise 2D murah (2 oktaf) — sumber "energi tidak stabil"
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);

    // noise "energi tidak stabil" — bergerak pelan mengikuti waktu
    vec2 np = vUv * uNoiseScale + vec2(uTime * 0.05, -uTime * 0.03) + uSeed;
    float n = vnoise(np);
    float n2 = vnoise(np * 2.3 + 7.7);
    float energy = 1.0 + (n * 0.55 + n2 * 0.25) * uNoiseStrength;

    // strip diagonal ala Persona — uv-nya di-distort noise biar tidak rigid
    float stripes = smoothstep(0.72, 0.92, fract((vUv.x - vUv.y * 0.5 + uSeed * 0.01) * 5.0 + n * 0.6));

    // scanline VERTIKAL bergerak mengikuti uTime (band horizontal berjalan)
    float scan = 0.5 + 0.5 * sin(vUv.y * 46.0 - uTime * uScanSpeed * 2.0);
    scan = pow(scan, 6.0);

    // fresnel edge glow: tepi panel menyala lebih terang dari tengah
    // (sudut antara normal panel dan arah pandang kamera)
    vec3 V = normalize(cameraPosition - vWorldPos);
    float fres = pow(1.0 - abs(dot(V, normalize(vWorldNormal))), uFresnelPower);

    // mask radial: tepi tegas + glow menuju tengah
    float edge = smoothstep(0.5, 0.32, d);
    float glow = smoothstep(0.44, 0.05, d);
    float mask = edge * glow;

    // denyut lembut biar scene terasa hidup
    float pulse = 0.72 + 0.28 * sin(uTime * 1.3 + uSeed * 12.0);

    vec3 col = uColor * (0.26 + 1.15 * stripes) * energy;
    col *= pulse * (0.5 + 0.5 * fres * 1.6);
    col *= scan * 0.55 + 0.65;
    col *= uGlowIntensity * 0.9;
    col += uColor * fres * 0.8; // penekanan tepi

    gl_FragColor = vec4(col * mask, mask * uOpacity);
  }
`

export interface PanelMaterialOptions {
  /** Kecepatan scanline vertikal (default 0.9) */
  scanSpeed?: number
  /** Intensitas glow keseluruhan (default 1.0) */
  glowIntensity?: number
  /** Skala noise — makin besar makin halus teksturnya (default 3.5) */
  noiseScale?: number
  /** Kekuatan noise — 0 = halus, 1 = sangat bergolak (default 0.5) */
  noiseStrength?: number
  /** Eksponen fresnel — makin besar tepi makin menyala (default 2.5) */
  fresnelPower?: number
}

/** Panel geometris melayang — additive blend supaya menyala di atas bloom. */
export function createPanelMaterial(seed: number, options: PanelMaterialOptions = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#dc143c') },
      uSeed: { value: seed },
      uOpacity: { value: 1 },
      uScanSpeed: { value: options.scanSpeed ?? 0.9 },
      uGlowIntensity: { value: options.glowIntensity ?? 1.0 },
      uNoiseScale: { value: options.noiseScale ?? 3.5 },
      uNoiseStrength: { value: options.noiseStrength ?? 0.5 },
      uFresnelPower: { value: options.fresnelPower ?? 2.5 },
    },
    vertexShader: panelVertex,
    fragmentShader: panelFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

/* ------------------------------------------------------------------ */
/* 2. GROUND — grid yang fade berdasarkan jarak DARI KAMERA            */
/* ------------------------------------------------------------------ */

const groundVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const groundFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uCamPos;   // posisi kamera (di-set tiap frame dari JS)
  uniform float uTime;
  varying vec3 vWorld;

  void main() {
    // grid kotak pakai fwidth supaya garis konsisten di semua jarak
    vec2 g = vWorld.xz * 0.25;
    vec2 grid = abs(fract(g) - 0.5);
    vec2 df = fwidth(g);
    float line = 1.0 - min(min(grid.x / df.x, grid.y / df.y), 1.0);

    // denyut ring dari pusat scene
    float pulse = 0.55 + 0.45 * sin(uTime * 0.7 - length(vWorld.xz) * 0.3);

    // fade berdasarkan jarak DARI KAMERA (bukan origin) —
    // grid menghilang halus di belakang objek, memberi rasa kedalaman
    float camDist = length(vWorld.xz - uCamPos.xz);
    float fade = 1.0 - smoothstep(12.0, 38.0, camDist);

    vec3 col = mix(uBase, uLine, line * pulse);
    gl_FragColor = vec4(col * fade, 1.0);
  }
`

/** Lantai grid merah-redup — gaya menu "dungeon" Persona. */
export function createGroundMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color('#0e0e0f') },
      uLine: { value: new THREE.Color('#dc143c') },
      uCamPos: { value: new THREE.Vector3() },
      uTime: { value: 0 },
    },
    vertexShader: groundVertex,
    fragmentShader: groundFragment,
  })
}

/* ------------------------------------------------------------------ */
/* 3. KARTU — vertex ripple saat hover + border putus-putus berjalan   */
/* ------------------------------------------------------------------ */

const cardVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;

    // --- vertex distortion saat hover:
    // ripple dari titik tengah, amplitudo naik seiring uHover
    // (butuh planeGeometry dengan segmen cukup, bukan 4 vertex polos)
    float d = length(uv - 0.5);
    float ripple = sin(d * 34.0 - uTime * 6.0) * smoothstep(0.5, 0.0, d);
    vec3 displaced = position + normal * (ripple * uHover * 0.035);

    vec4 wp = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const cardFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uHover;
  uniform float uDashSpeed;     // kecepatan border putus-putus berjalan
  uniform float uNoiseStrength; // noise halus anti "plastik"
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // pola dash — t = koordinat sepanjang tepi, jalan mundur seiring waktu
  float dashVal(float t) {
    return step(0.55, fract(t * 8.0 - uTime * uDashSpeed));
  }

  void main() {
    vec2 p = vUv;

    // --- border putus-putus yang "berjalan" mengelilingi kartu
    // 4 sisi di-orientasikan berlawanan supaya alur dash kontinu
    float border = 0.0;
    border += (1.0 - smoothstep(0.0, 0.05, p.y))       * dashVal(p.x);        // bawah
    border += (1.0 - smoothstep(0.0, 0.05, 1.0 - p.y)) * dashVal(1.0 - p.x);  // atas
    border += (1.0 - smoothstep(0.0, 0.05, p.x))       * dashVal(1.0 - p.y);  // kiri
    border += (1.0 - smoothstep(0.0, 0.05, 1.0 - p.x)) * dashVal(p.y);        // kanan

    // anti-aliasing tepi kartu (sudut TEGAS, bukan rounded)
    float ex = min(p.x, 1.0 - p.x);
    float ey = min(p.y, 1.0 - p.y);
    float aa = smoothstep(0.0, 0.03, ex) * smoothstep(0.0, 0.03, ey);

    // slash diagonal merah menyilang kartu (energi "menyerang")
    float slash = 1.0 - smoothstep(0.36, 0.48, abs(p.x + p.y - 0.72));
    slash *= 0.72 + 0.28 * uHover;

    // scanline halus
    float scan = 1.0 - abs(fract(uTime * 0.6 - p.y * 2.0) - 0.5) * 2.0;

    // fresnel tepi — kartu tampak "menonjol" saat dimiringkan
    vec3 V = normalize(cameraPosition - vWorldPos);
    float fres = pow(1.0 - abs(dot(V, normalize(vWorldNormal))), 3.0);

    // noise halus supaya permukaan tidak flat polos
    float n = vnoise(p * 3.0 + uTime * 0.05) * uNoiseStrength;

    vec3 base = mix(vec3(0.055, 0.055, 0.065), vec3(0.11, 0.105, 0.115), 1.0);
    vec3 col = mix(base, uAccent, slash);
    col = mix(col, uAccent, border * 0.85);
    col += uAccent * pow(scan, 28.0) * 0.22;
    col += vec3(0.16, 0.16, 0.17) * uHover * aa;
    col += n * 0.06;
    col += uAccent * fres * 0.35 * (0.4 + 0.6 * uHover);

    gl_FragColor = vec4(col, aa);
  }
`

export interface CardMaterialOptions {
  /** Kecepatan border putus-putus berjalan (default 1.2) */
  dashSpeed?: number
  /** Noise halus anti plastik (default 0.25) */
  noiseStrength?: number
}

/** Kartu proyek 3D — background hitam + slash merah + border dash berjalan. */
export function createCardMaterial(seed: number, options: CardMaterialOptions = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAccent: { value: new THREE.Color('#dc143c') },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uDashSpeed: { value: options.dashSpeed ?? 1.2 },
      uNoiseStrength: { value: options.noiseStrength ?? 0.25 },
      uSeed: { value: seed },
    },
    vertexShader: cardVertex,
    fragmentShader: cardFragment,
    transparent: true,
    side: THREE.DoubleSide,
  })
}

/* ------------------------------------------------------------------ */
/* 4. DUST — ribuan partikel dalam SATU draw call (GPU-driven)         */
/*    Animasi ada di vertex shader, bukan JS → nol biaya per-frame     */
/* ------------------------------------------------------------------ */

const dustVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uDpr; // device pixel ratio supaya ukuran titik konsisten
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // drift pelan ke atas + osilasi halus per partikel
    p.y += sin(uTime * 0.25 + aSeed) * 0.8;
    p.x += sin(uTime * 0.18 + aSeed * 1.7) * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // ukuran titik mengecil seiring jarak (perspective) + kedip
    float twinkle = 0.5 + 0.5 * sin(uTime * 0.9 + aSeed * 5.0);
    gl_PointSize = (0.35 + 0.25 * twinkle) * uDpr * (160.0 / -mv.z);

    vAlpha = 0.3 + 0.7 * twinkle;
  }
`

const dustFragment = /* glsl */ `
  precision highp float;
  varying float vAlpha;

  void main() {
    // lingkaran lembut via gl_PointCoord
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.08, d) * vAlpha;
    // inti terang, pinggir merah gelap
    vec3 col = mix(vec3(0.8, 0.06, 0.16), vec3(1.0, 0.42, 0.5), d * 1.8);
    gl_FragColor = vec4(col, a);
  }
`

/** Partikel debu — tambahkan geometry ber-attribute `aSeed` agar shader jalan. */
export function createDustMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDpr: { value: 1 },
    },
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/* ------------------------------------------------------------------ */
/* 5. TOON — karakter anime: step lighting + rim light berenergi       */
/*    (bukan PBR realistis — ringan di GPU integrated)                 */
/* ------------------------------------------------------------------ */

const toonVertex = /* glsl */ `
  // skinning support: ShaderMaterial perlu #ifdef USE_SKINNING + skinning:true
  #ifdef USE_SKINNING
    #include <skinning_pars_vertex>
  #endif
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 transformed = position;
    #ifdef USE_SKINNING
      #include <skinning_vertex>
    #endif
    vec4 wp = modelMatrix * vec4(transformed, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const toonFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;        // warna dasar karakter
  uniform vec3 uShadowColor;  // tint band bayangan (toon)
  uniform vec3 uRimColor;     // warna rim light — BISA diatur dari luar
  uniform float uRimIntensity;// kekuatan rim light — BISA diatur dari luar
  uniform float uRimPower;    // ketajaman falloff rim
  uniform float uTime;        // untuk pulse halus
  uniform float uPulseSpeed;  // kecepatan pulse
  uniform vec3 uLightDir;     // arah lampu utama (world space)
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uLightDir);

    // abs() — model export tertentu (Sketchfab) punya normal terbalik
    // (negative scale pada node); abs() menjamin karakter tetap terang
    float ndl = abs(dot(N, L));

    // --- toon step lighting: band datar, bukan gradien PBR
    // 0.62 (bayangan) → 1.0 (terang) → 1.25 (highlight pertama)
    float light = mix(0.62, 1.0, step(0.30, ndl));
    light = mix(light, 1.25, step(0.66, ndl));

    // spec keras ala anime (band, bukan blinn-phong halus)
    float spec = step(0.85, pow(max(dot(reflect(-V, N), L), 0.0), 32.0));
    light += spec * 0.45;

    vec3 col = uColor * min(light, 1.3);

    // tint bayangan hanya di band gelap (konsisten dengan gaya toon)
    col = mix(col, col * uShadowColor, 1.0 - step(0.30, ndl));

    // brightness minimum — karakter TIDAK pernah hitam total di atas
    // latar hitam, tetap kelihatan walau lighting paling ekstrem
    col = max(col, uColor * 0.22);

    // --- rim light: energi menyala di tepi karakter
    // fresnel + pulse halus berbasis uTime
    float fres = pow(1.0 - abs(dot(N, V)), uRimPower);
    float pulse = 0.65 + 0.35 * sin(uTime * uPulseSpeed);
    col += uRimColor * fres * uRimIntensity * pulse;

    gl_FragColor = vec4(col, 1.0);
  }
`

export interface ToonMaterialOptions {
  /** Warna dasar karakter (default #f5f2ee — off-white) */
  color?: string
  /** Tint band bayangan (default #8a2438 — merah gelap, TIDAK terlalu gelap) */
  shadowColor?: string
  /** Warna rim light di tepi karakter (default #ff2d55) */
  rimColor?: string
  /** Kekuatan rim light (default 1.4) */
  rimIntensity?: number
  /** Ketajaman falloff rim (default 3.0 — makin besar makin tipis) */
  rimPower?: number
  /** Kecepatan pulse rim (default 1.6) */
  pulseSpeed?: number
  /** Arah lampu utama dalam world space (default dari kiri-atas) */
  lightDir?: [number, number, number]
  /** Render kedua sisi — default true, aman untuk model export apa pun */
  doubleSide?: boolean
  /** Aktifkan skinning (SkinnedMesh) — default true, dibutuhkan karakter ber-rig */
  skinning?: boolean
}

/**
 * Toon shader untuk karakter 3D (anime/ethereal).
 * Ringan: step lighting 3 band + fresnel — tanpa PBR, tanpa texture lookup.
 */
export function createToonMaterial(options: ToonMaterialOptions = {}): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(options.color ?? '#f5f2ee') },
      uShadowColor: { value: new THREE.Color(options.shadowColor ?? '#8a2438') },
      uRimColor: { value: new THREE.Color(options.rimColor ?? '#ff2d55') },
      uRimIntensity: { value: options.rimIntensity ?? 1.4 },
      uRimPower: { value: options.rimPower ?? 3.0 },
      uTime: { value: 0 },
      uPulseSpeed: { value: options.pulseSpeed ?? 1.6 },
      uLightDir: {
        value: new THREE.Vector3(...(options.lightDir ?? [0.6, 1.0, 0.4])),
      },
    },
    vertexShader: toonVertex,
    fragmentShader: toonFragment,
    side: options.doubleSide ?? true ? THREE.DoubleSide : THREE.FrontSide,
  })

  // aktifkan USE_SKINNING di program → three.js otomatis menyuntik
  // boneMatrices + bindMatrix ke shader untuk SkinnedMesh
  const skinning = options.skinning ?? true
  ;(material as THREE.ShaderMaterial & { skinning: boolean }).skinning = skinning

  return material
}