import * as THREE from 'three'

/**
 * ==== SHADER MATERIALS (Custom GLSL) ====
 * Semua panel/kartu pakai shader sendiri, bukan aset model —
 * geometri abstrak ala UI Persona: sudut tajam, strip diagonal,
 * glow merah, scanline.
 */

const panelVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const panelFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSeed;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);

    // tepi tegas (sharp edge) + glow radial ke tengah
    float edge = smoothstep(0.5, 0.32, d);
    float glow = smoothstep(0.44, 0.04, d);

    // strip diagonal ala Persona
    float stripes = smoothstep(0.76, 0.92, fract((vUv.x - vUv.y * 0.5 + uSeed) * 5.0));

    // denyut lembut biar scene terasa hidup
    float pulse = 0.72 + 0.28 * sin(uTime * 1.3 + uSeed * 12.0);

    // scanline menyapu dari bawah ke atas
    float scan = 1.0 - abs(fract(uTime * 0.35 - vUv.y * 1.4) - 0.5) * 2.0;

    float mask = edge * glow;
    vec3 col = uColor * (0.28 + 1.25 * stripes) * mask * (0.55 + 0.5 * pulse) * scan;

    gl_FragColor = vec4(col, mask * uOpacity);
  }
`

/** Panel geometris melayang — additive blend supaya menyala di atas bloom. */
export function createPanelMaterial(seed: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#dc143c') },
      uSeed: { value: seed },
      uOpacity: { value: 1 },
    },
    vertexShader: panelVertex,
    fragmentShader: panelFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

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
  varying vec3 vWorld;

  void main() {
    // grid kotak pakai fwidth supaya garis konsisten di semua jarak
    vec2 g = vWorld.xz * 0.25;
    vec2 grid = abs(fract(g) - 0.5);
    vec2 df = fwidth(g);
    float line = 1.0 - min(min(grid.x / df.x, grid.y / df.y), 1.0);

    // fade ke hitam menjauh dari kamera
    float fade = 1.0 - smoothstep(6.0, 55.0, length(vWorld.xz));

    vec3 col = mix(uBase, uLine, line * 0.9);
    gl_FragColor = vec4(col * fade, 1.0);
  }
`

/** Lantai grid merah-redup — gaya menu "dungeon" Persona. */
export function createGroundMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color('#0e0e0f') },
      uLine: { value: new THREE.Color('#dc143c') },
    },
    vertexShader: groundVertex,
    fragmentShader: groundFragment,
  })
}

const cardVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cardFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv;

    // anti-aliasing tepi kartu (sudut TEGAS, bukan rounded)
    float ex = min(p.x, 1.0 - p.x);
    float ey = min(p.y, 1.0 - p.y);
    float aa = smoothstep(0.0, 0.03, ex) * smoothstep(0.0, 0.03, ey);

    // border tipis mengelilingi kartu
    float border = 1.0 - smoothstep(0.0, 0.035, min(ex, ey));

    // slash diagonal merah menyilang kartu (energi "menyerang")
    float slash = 1.0 - smoothstep(0.36, 0.48, abs(p.x + p.y - 0.72));

    // scanline halus
    float scan = 1.0 - abs(fract(uTime * 0.6 - p.y * 2.0) - 0.5) * 2.0;

    vec3 base = mix(vec3(0.055, 0.055, 0.065), vec3(0.11, 0.105, 0.115), border);
    vec3 col = mix(base, uAccent, slash * (0.72 + 0.28 * uHover));
    col += uAccent * pow(scan, 28.0) * 0.22;
    col += vec3(0.16, 0.16, 0.17) * uHover * aa;

    gl_FragColor = vec4(col, aa);
  }
`

/** Kartu proyek 3D — background hitam + slash merah + border tegas. */
export function createCardMaterial(seed: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAccent: { value: new THREE.Color('#dc143c') },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uSeed: { value: seed },
    },
    vertexShader: cardVertex,
    fragmentShader: cardFragment,
    transparent: true,
    side: THREE.DoubleSide,
  })
}
