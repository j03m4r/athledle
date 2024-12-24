<script setup lang="ts">
  import {useAuthStore} from '@/stores/auth'
  import {storeToRefs} from 'pinia'
  import {onMounted, ref} from 'vue';
  import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

  const auth = useAuthStore();
  const {user} = storeToRefs(auth);
  const {login, logout, ensureInitialized} = auth;

  const isLoading = ref < boolean > (true);
  const color = ref("#3B3636")

  onMounted(async () => {
    await ensureInitialized();
    isLoading.value = false;
  })
</script>
<template>
  <div v-if="isLoading" class="w-full flex justify-center items-center h-[20vh]">
    <pulse-loader :loading="true" :color="color"></pulse-loader>
  </div>
  <div v-else-if="user === null" class="w-full flex flex-col items-center gap-y-2">
    <p>No user logged in</p>
    <p class="font-extralight w-fit">
      <button @click="login" class="underline">Login</button>
      to see profile
    </p>
  </div>
  <div v-else-if="user !== null" class="w-full flex flex-col items-center gap-y-8">
    <div class="flex flex-col items-center gap-y-4">
      <img :src="user.photoURL || ''" class="w-[40vw] h-[40vw] md:w-[10vw] md:h-[10vw] rounded-full" />
      <h1 class="text-black font-bold text-xl">{{ user.displayName }}</h1>
      <button @click="logout" class="flex justify-center items-center border border-black font-medium text-black rounded-lg py-2 px-4
          w-full gap-x-2 hover:border-red transition-all duration-200 ease-in-out hover:text-red">
        Logout
        <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
      </button>
    </div>
    <div class="w-full h-full flex justify-center items-center font-light text-black">
        Stats coming soon...
    </div>
  </div>
</template>
