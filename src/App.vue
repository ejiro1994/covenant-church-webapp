<template>
  <Navbar />
  <WebglBackground />
  <!-- <div class="white-fade-overlay" ref="fadeOverlay"></div> -->
  <div class="top-fade-overlay"></div>
  <!-- <HeroSection /> -->
  <BulgeImageWithText src="/image-1.jpg" text="Discover" :radius=".9" :width="300" :height="400"/>
  <BulgeImageWithText src="/image-2.jpg" text="Discover" :radius=".9" :width="300" :height="400"/>
  <BulgeImageWithText src="/image-3.jpg" text="Discover" :radius=".9" :width="300" :height="400"/>
  <BulgeImageWithText src="/image-4.jpg" text="Discover" :radius=".9" :width="300" :height="400"/>
  <BulgeImageWithText src="/image-5.jpg" text="Discover" :radius=".9" :width="300" :height="400"/>
  <BulgeImageWithText src="/image-6.jpg" text="Discover" :radius=".9" :width="300" :height="400"/>
  <div class="content">
  
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import Navbar from './components/Navbar.vue'
import WebglBackground from './WebglBackground.vue'
import HeroSection from './components/HeroSection.vue'
import BulgeImageWithText from './components/BulgeImageWithText.vue'
import Lenis from 'lenis'

const fadeOverlay = ref<HTMLElement | null>(null)
let lenis

onMounted(() => {
  lenis = new Lenis({
    lerp: 0.08, // smoothness
    infinite: false,
  })
  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  if (fadeOverlay.value) {
    gsap.to(fadeOverlay.value, {
      opacity: 0,
      // delay: 2,
      duration: 1.5,
      ease: 'power3.out',
      pointerEvents: 'none',
      onComplete: () => {
        // Optionally, remove the overlay from DOM
        fadeOverlay.value && (fadeOverlay.value.style.display = 'none')
      }
    })
  }
})
</script>

<style scoped>
.content {
  position: relative;
  z-index: 1;
  color: #222;
  padding: 3rem;
  text-align: center;
  height: 500vh;
}
h1 {
  margin-bottom: 1rem;
}

.white-fade-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 1;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.4s;
}

.top-fade-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0) 80%);
}

</style>
