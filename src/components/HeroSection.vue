<template>
  <section class="hero-section">
    <div class="hero-content">
      <img src="../assets/Covenant-Color-Logo.svg" alt="Covenant Logo">
      <h1>Welcome to the Hero Section</h1>
      <p>This section fades from white to transparent as you scroll down.</p>
    </div>
  </section>
</template>

<script setup>
// Add props or emits here if needed in the future
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0) 100%);
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
</style>
