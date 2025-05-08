<template>
  <Navbar />
  <WebglBackground />
  <div class="top-fade-overlay"></div>
  <!-- <HeroSection /> -->
  <div class="content">
  
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import WebglBackground from './WebglBackground.vue'
import HeroSection from './components/HeroSection.vue'
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
