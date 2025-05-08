<template>
  <Navbar />
  <WebglBackground />
  <!-- <div class="white-fade-overlay" ref="fadeOverlay"></div> -->
  <div class="top-fade-overlay"></div>
  <!-- <HeroSection /> -->
  <BulgeImageWithText src="/src/assets/image-2.webp" text="Discover"   :radius="1.1" width="150" height="200"/>
  <div class="content">
  
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import Navbar from './components/Navbar.vue'
import WebglBackground from './WebglBackground.vue'
import HeroSection from './components/HeroSection.vue'
import BulgeImageWithText from './components/BulgeImageWithText.vue'

const fadeOverlay = ref<HTMLElement | null>(null)

onMounted(() => {
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
