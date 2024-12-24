<script setup lang="ts">
  import {ref, onMounted} from 'vue'
  import {RouterLink, RouterView} from 'vue-router'
  import {useAuthStore} from '@/stores/auth'
  import {storeToRefs} from 'pinia'
  import Navbar from '@/components/Navbar.vue';
  import Modal from '@/components/Modal.vue';

  const auth = useAuthStore();
  const {user} = storeToRefs(auth);
  const {initAuth, login, logout} = auth;
  onMounted(async () => {
    await initAuth();
  });
</script>

<template>
  <div class="w-full h-full flex flex-col justify-start items-center">
    <Navbar />
    <Modal />
    <main class="w-full max-w-[1280px] px-8 md:px-0">
      <RouterView />
    </main>
  </div>
</template>
