<template>
  <nav class="navbar">
    <div class="navbar-logo">
      <img src="/src/assets/Covenant-Color-Logo.svg" alt="Logo" />
    </div>
    <!-- Add nav links here if needed -->
  </nav>
</template>

<script setup lang="ts">
// No script logic needed for now
</script>

<style scoped>
.navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 64px;
  display: flex;
  align-items: center;
  /* background: rgba(255,255,255,0.95); */
  z-index: 10;
  padding: 0 2rem;
}
.navbar-logo {
  display: flex;
  align-items: center;
  height: 100%;
}
.navbar-logo img {
  height: 40px;
  width: auto;
}
</style>
