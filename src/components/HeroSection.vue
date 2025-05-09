<template>
  <section class="hero-section">
    <div class="hero-content">
      <!-- <img src="../assets/Covenant-Color-Logo.svg" alt="Covenant Logo"> -->
      <div class="hero-flex">
        <h1 class="hero-headline">No More<br>Wilderness.<br>Welcome to<br>Promise.</h1>
        <BulgeImageWithText src="/image-1.jpg" text="Discover" :radius=".9" :width="300/2" :height="400/2"/>
      </div>
      <!-- <p>This section fades from white to transparent as you scroll down.</p> -->
    </div>
  </section>
</template>

<script setup>
import BulgeImageWithText from './BulgeImageWithText.vue'
// Add props or emits here if needed in the future
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap');
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgba(255,255,255,0) 100%); */
  background: linear-gradient(
    to bottom,
    rgb(255,255,255) 0%,
    rgb(255,255,255) 40%,
    rgba(255,255,255,0) 100%
  );
  width: 100%;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #222;
  padding: 2rem;
}

.hero-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}

.hero-headline {
  flex: 1;
  text-align: left;
  font-size: 9rem;
}

.hero-flex > *:not(:last-child) {
  margin-right: 1.5rem;
}

@font-face {
  font-family: 'HeroRegular';
  src: url('@/assets/fonts/regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'HeroBold';
  src: url('@/assets/fonts/bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}

.hero-headline {
  font-family: 'HeroBold', 'PT Sans', Arial, sans-serif;
  font-size: 2.7rem;
  font-weight: 700;
  margin: 2rem 0 1.5rem 0;
  line-height: 1.15;
  letter-spacing: 0.01em;
  color: #13505B;
  text-align: left;
}

.promise-font {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 700;
  font-size: 3.2rem;
  color: #0FACB2;
  display: inline-block;
  line-height: 1.1;
  letter-spacing: 0.01em;
}
@media (max-width: 600px) {
  .hero-headline {
    font-size: 1.7rem;
    margin-top: 1.2rem;
    margin-bottom: 1rem;
  }
  .promise-font {
    font-size: 2.1rem;
  }
}

@media (max-width: 600px) {
  .hero-headline {
    font-size: 1.7rem;
    margin-top: 1.2rem;
    margin-bottom: 1rem;
  }
}

</style>
