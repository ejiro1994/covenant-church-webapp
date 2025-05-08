<template>
  <canvas ref="bgCanvas" class="background-canvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
// @ts-ignore
import { Renderer, Program, Color, Mesh, Triangle, Vec2 } from 'ogl';

const scrollY = ref(0);

// GLSL shaders as string literals
const vertex = `
attribute vec2 uv;
attribute vec2 position;

uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}`;

const fragment = `
precision highp float;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uScroll;

varying vec2 vUv;

// Simple 2D noise function (GLSL classic noise, replace with glsl-noise if you have a loader)
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  float n = noise(vUv * 3.0 + uScroll + sin(uTime / 10.0));
  vec3 color = mix(uColor1, uColor2, n);
  gl_FragColor = vec4(color, 1.0);
}`;

const bgCanvas = ref<HTMLCanvasElement | null>(null);
let renderer: any, program: any, mesh: any;
let rafId: number;

function resize() {
  if (!renderer || !program) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  program.uniforms.uResolution.value = new Vec2(w, h);
}

function animate(t = 0) {
  if (program) {
    program.uniforms.uTime.value = t * 0.001;
    program.uniforms.uScroll.value = scrollY.value * 2; // scale as in original
    renderer.render({ scene: mesh });
  }
  rafId = requestAnimationFrame(animate);
}

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollY.value = docHeight > 0 ? scrollTop / docHeight : 0;
}

onMounted(() => {
  if (!bgCanvas.value) return;
  renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio, 2),
    canvas: bgCanvas.value,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { gl } = renderer;
  program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uColor1: { value: new Color('#fff') },
      uColor2: { value: new Color('#0FACB2') },
      uResolution: { value: new Vec2(gl.canvas.offsetWidth, gl.canvas.offsetHeight) },
    },
  });
  const geometry = new Triangle(gl);
  mesh = new Mesh(gl, { geometry, program });
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll);
  onScroll(); // set initial scroll value
  animate();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  window.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  z-index: -1;
}
</style>
