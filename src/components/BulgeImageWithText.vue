<template>
    <div
      class="bulge-image-card"
      :style="{ width: width + 'px', height: height + 'px' }"
      :class="{ loaded: loaded }"
      @mousemove="onMouseMove"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <canvas ref="canvas" class="bulge-canvas"></canvas>
      <!-- <div class="discover-text">{{ text }}</div> -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  import gsap from 'gsap'
  import { Renderer, Program, Mesh, Geometry, Texture, Vec2 } from 'ogl'
  
  const props = defineProps({
    src: { type: String, required: true },
    text: { type: String, default: 'discover' },
    width: { type: Number, default: 600 },
    height: { type: Number, default: 400 },
    radius: { type: Number, default: 0.95 },
    strength: { type: Number, default: 1.1 },
    bulge: { type: Number, default: 1.0 },
  })
  
  const canvas = ref(null)
  const loaded = ref(false)
  let renderer, gl, program, mesh, texture
  let animationFrame
  let uniforms
  const mouse = new Vec2(0.5, 0.5)
  const mouseIntro = new Vec2(0.5, 0.5)
  const uIntro = { value: 0 }
  const uBulge = { value: 0 }
  
  function animateIntro() {
  uBulge.value = 0;
  uIntro.value = 0;
  gsap.fromTo(
    uBulge,
    { value: 0 },
    { value: 1, duration: 1.8, ease: 'power3.out' }
  );
  gsap.to(uIntro, {
    value: 1,
    duration: 5,
    onComplete: () => {
      loaded.value = true // triggers text animation
    }
  });
}
  
  // IntersectionObserver for scroll-into-view intro trigger
  let observer = null;
  onMounted(async () => {
    await nextTick();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer = new Renderer({ dpr, canvas: canvas.value });
    gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
  
    // Geometry (plane)
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]) },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) },
      index: { data: new Uint16Array([0, 1, 2, 0, 2, 3]) },
    })
  
    // Texture
    texture = new Texture(gl)
    const image = new window.Image()
    image.crossOrigin = ''
    await new Promise(resolve => {
      image.onload = () => {
        texture.image = image
        if ('needsUpdate' in texture) texture.needsUpdate = true
        if (program && program.uniforms.uImageSize) {
          program.uniforms.uImageSize.value = new Vec2(image.width, image.height)
        }
        loaded.value = true // triggers text animation if needed
        render() // Start rendering only after image is loaded
        resolve()
      }
      image.src = props.src
      if (image.complete) {
        image.onload()
      }
    })
  
    // Shaders
    const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
      }
    `
  
    const fragment = `
      precision highp float;
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform vec2 uMouseIntro;
      uniform float uIntro;
      uniform float uBulge;
      uniform float uRadius;
      uniform float uStrength;
      uniform vec2 uCanvasSize;
      uniform vec2 uImageSize;
      varying vec2 vUv;

      // --- GLSL bulge distortion function ---
      vec2 bulge(vec2 uv, vec2 mouse) {
        float d = distance(uv, mouse);
        float bulgeEffect = uBulge * uStrength * smoothstep(uRadius, 0.0, d);
        vec2 dir = normalize(uv - mouse);
        return mix(uv, mouse + dir * d * (1.0 + bulgeEffect), bulgeEffect);
      }

      // --- GLSL coverUv mapping function ---
      vec2 coverUv(vec2 uv, vec2 canvasSize, vec2 imageSize) {
        float screenRatio = canvasSize.x / canvasSize.y;
        float imageRatio = imageSize.x / imageSize.y;
        vec2 newUv = uv;
        if (screenRatio < imageRatio) {
          float scale = canvasSize.y * imageRatio / imageSize.x;
          newUv.x = (uv.x - 0.5) * scale + 0.5;
        } else {
          float scale = canvasSize.x / (imageRatio * imageSize.y);
          newUv.y = (uv.y - 0.5) * scale + 0.5;
        }
        return newUv;
      }

      void main() {
        vec2 mixMouse = mix(uMouseIntro, uMouse, uIntro);
        vec2 bulgeUV = bulge(vUv, mixMouse);
        vec2 canvasSize = uCanvasSize;
        vec2 imageSize = uImageSize;
        vec2 coverUV = coverUv(bulgeUV, canvasSize, imageSize);
        vec4 tex = texture2D(uTexture, coverUV);
        gl_FragColor = tex;
      }
    `
  
    // Uniforms
    uniforms = {
      uTime: { value: 0 },
      uTexture: { value: texture },
      uMouse: { value: new Vec2(0.5, 0.5) },
      uMouseIntro: { value: mouseIntro },
      uIntro,
      uRadius: { value: props.radius },
      uStrength: { value: props.strength },
      uBulge,
      uCanvasSize: { value: new Vec2(1, 1) }, // Will update after mount
      uImageSize: { value: new Vec2(1, 1) }, // Will update after image loads
    }

    // Defensive check: log and warn if any uniforms are undefined or wrong type
Object.entries(uniforms).forEach(([key, val]) => {
  if (!val || typeof val !== 'object' || !('value' in val)) {
    console.warn(`Uniform '${key}' is not properly defined:`, val)
  }
})
console.log('Uniforms before Program creation:', uniforms)
  
    program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
      transparent: true,
    })
  
    mesh = new Mesh(gl, { geometry, program })
  
    // IntersectionObserver logic
    observer = new window.IntersectionObserver((entries) => {
      if (Array.isArray(entries)) {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateIntro();
        }
      });
      }
    }, { threshold: 0.3 });
    observer.observe(canvas.value?.parentElement);
  
    render()
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas);
    cancelAnimationFrame(animationFrame);
    if (renderer) renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (observer) observer.disconnect();
  });
  
  function onMouseMove(e) {
    const rect = canvas.value.getBoundingClientRect()
    mouse.x = (e.clientX - rect.left) / rect.width
    mouse.y = (e.clientY - rect.top) / rect.height
  }
  
  let tlEnter = null
  let tlLeave = null
  
  function onMouseEnter() {
    tlLeave?.kill()
    tlEnter?.kill()
    tlEnter = gsap.to(uBulge, { value: 1, duration: 1, ease: 'expo.out' })
  }
  
  function onMouseLeave() {
    tlEnter?.kill()
    tlLeave?.kill()
    tlLeave = gsap.to(uBulge, { value: 0, duration: 1, ease: 'expo.out' })
  }
  
  function render() {
    if (program) {
      program.uniforms.uMouse.value.set(mouse.x, 1 - mouse.y)
      program.uniforms.uIntro.value = uIntro.value
      program.uniforms.uBulge.value = uBulge.value
      program.uniforms.uRadius.value = props.radius
      program.uniforms.uStrength.value = props.strength
      // Helper to check mesh and geometry validity
      function isMeshRenderable(mesh) {
        if (!mesh || !mesh.geometry || !mesh.geometry.attributes) return false;
        const attrs = mesh.geometry.attributes;
        // Check for required attributes (position, uv, index)
        return ['position', 'uv', 'index'].every(
          key => Array.isArray(attrs[key]?.data) || attrs[key]?.data instanceof Float32Array || attrs[key]?.data instanceof Uint16Array
        );
      }

      if (isMeshRenderable(mesh)) {
        renderer.render({ scene: mesh })
      } else {
        console.warn('Mesh or its geometry/attributes are not valid in render()', {
          mesh,
          geometry: mesh?.geometry,
          attributes: mesh?.geometry?.attributes
        });
      }
    }
    animationFrame = requestAnimationFrame(render)
  }
  
  function resizeCanvas() {
    const card = canvas.value?.parentElement;
    if (canvas.value && card) {
      const rect = card.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.value.width = rect.width * dpr;
      canvas.value.height = rect.height * dpr;
      canvas.value.style.width = rect.width + 'px';
      canvas.value.style.height = rect.height + 'px';
      if (renderer) renderer.setSize(rect.width, rect.height);
      // Use logical size for uCanvasSize (not multiplied by dpr)
      if (program && program.uniforms.uCanvasSize) {
        program.uniforms.uCanvasSize.value = new Vec2(rect.width, rect.height);
      }
    }
  }
  
  onMounted(async () => {
    await nextTick();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer = new Renderer({ dpr, canvas: canvas.value });
    gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
  
    // Geometry (plane)
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]) },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) },
      index: { data: new Uint16Array([0, 1, 2, 0, 2, 3]) },
    })
  
    // Texture
    texture = new Texture(gl)
    const image = new window.Image()
    image.crossOrigin = ''
    image.src = props.src
    await new Promise(resolve => {
      image.onload = () => {
        texture.image = image;
        // Set image size uniform
        if (program && program.uniforms.uImageSize) {
          program.uniforms.uImageSize.value = new Vec2(image.naturalWidth, image.naturalHeight);
        }
        resizeCanvas(); // Re-measure and update uniforms after image loads
        resolve();
      };
    })
  
    // Shaders
    const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
      }
    `
    const fragment = `
      precision highp float;
      uniform float uTime;
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform vec2 uMouseIntro;
      uniform float uIntro;
      uniform float uRadius;
      uniform float uStrength;
      uniform float uBulge;
      uniform vec2 uCanvasSize;
      uniform vec2 uImageSize;
      varying vec2 vUv;
      
      // Helper to make UVs act like background-size: cover
      vec2 coverUv(vec2 uv, vec2 canvas, vec2 image) {
        float canvasAspect = canvas.x / canvas.y;
        float imageAspect = image.x / image.y;
        vec2 newUv = uv;
        if (canvasAspect > imageAspect) {
          float scale = canvasAspect / imageAspect;
          newUv.y = (uv.y - 0.5) * scale + 0.5;
        } else {
          float scale = imageAspect / canvasAspect;
          newUv.x = (uv.x - 0.5) * scale + 0.5;
        }
        return newUv;
      }
  
      vec2 bulge(vec2 uv, vec2 center) {
        uv -= center;
        float dist = length(uv) / uRadius;
        float distPow = pow(dist, 4.);
        float strengthAmount = uStrength / (1.0 + distPow);
        uv *= (1. - uBulge) + uBulge * strengthAmount;
        uv += center;
        return uv;
      }
      void main() {
        vec2 mixMouse = mix(uMouseIntro, uMouse, uIntro);
        vec2 bulgeUV = bulge(vUv, mixMouse);
        // Assume canvas is same as gl_FragCoord resolution, image is texture size
        vec2 canvasSize = uCanvasSize;
        vec2 imageSize = uImageSize;
        vec2 coverUV = coverUv(bulgeUV, canvasSize, imageSize);
        vec4 tex = texture2D(uTexture, coverUV);
        gl_FragColor = tex;
      }
    `
  
    // Uniforms
    uniforms = {
      uTime: { value: 0 },
      uTexture: { value: texture },
      uMouse: { value: new Vec2(0.5, 0.5) },
      uMouseIntro: { value: mouseIntro },
      uIntro,
      uRadius: { value: props.radius },
      uStrength: { value: props.strength },
      uBulge,
      uCanvasSize: { value: new Vec2(1, 1) }, // Will update after mount
      uImageSize: { value: new Vec2(1, 1) }, // Will update after image loads
    }
  
    program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
      transparent: true,
    })
  
    mesh = new Mesh(gl, { geometry, program })
  
    animateIntro()
    render()
  })
  
  onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(animationFrame);
  if (renderer) renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
  })
  
  watch(() => props.radius, val => { if (program) program.uniforms.uRadius.value = val })
  watch(() => props.strength, val => { if (program) program.uniforms.uStrength.value = val })
  watch(() => props.bulge, val => { if (program) program.uniforms.uBulge.value = val })
  watch(() => props.width, resizeCanvas)
  watch(() => props.height, resizeCanvas)
  </script>
  
  <style scoped>
  .bulge-image-card {
    /* width: 230px; */
    /* height: 350px; */
    /* max-width: 400px; */
    max-height: 600px;
    margin: 15vh auto;
    position: relative;
    display: block;
    /* border-radius: 3vw; */
    overflow: hidden;
    /* box-shadow: 0 2px 16px rgba(0,0,0,0.12); */
  }
  .bulge-canvas {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    /* border-radius: 3vw; */
    pointer-events: none;
  }
  .discover-text {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    text-align: center;
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0;
    font-size: 2.2rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.12em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.25);
    pointer-events: none;
    transition: opacity 0.7s cubic-bezier(.77,0,.18,1), transform 0.7s cubic-bezier(.77,0,.18,1);
  }
  .bulge-image-card.loaded .discover-text {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  
  .discover-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0;
    font-size: 2.2rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.12em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.25);
    pointer-events: none;
    transition: opacity 0.7s cubic-bezier(.77,0,.18,1), transform 0.7s cubic-bezier(.77,0,.18,1);
  }
  .bulge-image-card.loaded .discover-text {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  </style>
  