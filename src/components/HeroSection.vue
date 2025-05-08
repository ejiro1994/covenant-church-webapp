<template>
  <section class="hero-section">
    <div class="hero-content">
      <!-- <img src="../assets/Covenant-Color-Logo.svg" alt="Covenant Logo"> -->
      <h1 class="hero-headline">No More<br>Wilderness.<br>Welcome to<br><span class="promise-font">Promise.</span></h1>
      <!-- <p>This section fades from white to transparent as you scroll down.</p> -->
    </div>
  </section>
</template>

<script setup>
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

.hero-headline {
  font-family: 'PT Sans', Arial, sans-serif;
  font-size: 2.7rem;
  font-weight: 700;
  margin: 2rem 0 1.5rem 0;
  line-height: 1.15;
  letter-spacing: 0.01em;
  color: #0FACB2;
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
