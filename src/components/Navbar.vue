<script setup>
import NavbarLink from './NavbarLink.vue';
</script>
<template>
  <nav class="flex w-full justify-center items-center py-8">
    <NavbarLink href="/" name="home">ATHLEDLE</NavbarLink>
    <div class="h-6 w-3 bg-white"></div>
    <NavbarLink href="/profile" name="profile">PROFILE</NavbarLink>
  </nav>
</template>
