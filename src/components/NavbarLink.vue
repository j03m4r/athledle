<script setup lang="ts">
defineProps(['name', 'href'])
import { useRoute } from 'vue-router'

const route = useRoute()

</script>
<template>
  <RouterLink :to='href' class="border font-medium text-black rounded-xl py-3 px-6 bg-white uppercase"
    :class="{ 'border-green': route.name === name, 'border-white': route.name !== name }">
    <slot />
  </RouterLink>
</template>
