<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useFirestoreStore, type Stats } from '@/stores/firestore'
import { storeToRefs } from 'pinia'
import { onMounted, ref, useTemplateRef, nextTick } from 'vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

const auth = useAuthStore();
const { user } = storeToRefs(auth);
const { login, logout, ensureInitialized } = auth;

const firestore = useFirestoreStore();
const { getStats } = firestore;

const winBarRef = useTemplateRef<HTMLElement>("win-bar");

const isLoading = ref<boolean>(true);
const color = ref<string>("#3B3636")
const stats = ref<Stats | null>(null);
const winPercent = ref(0);
const lossPercent = ref(0);
const guessesChartData = ref({
  labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
  datasets: [{ data: [0, 0, 0, 0, 0, 0, 0, 0] }]
});
const guessesChartOptions = ref({
  responsive: true,
  scales: {
    y: {
      display: true,
      ticks: {
        min: 0,
        stepSize: 1
      },
    },
  },
});

import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

function ceilToDecimal(num, decimalPlaces) {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.ceil(num * multiplier) / multiplier;
}

onMounted(async () => {
  await ensureInitialized();
  stats.value = await getStats();
  if (stats.value !== null) {
    guessesChartData.value = {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      datasets: [{ label: "Guesses", backgroundColor: color.value, data: [stats.value["1"], stats.value["2"], stats.value["3"], stats.value["4"], stats.value["5"], stats.value["6"], stats.value["7"], stats.value["8"]] }]
    };
  }

  isLoading.value = false;
  await nextTick();

  if (stats.value !== null) {
    winPercent.value = ceilToDecimal((stats.value.win_count / stats.value.game_count) * 100, 1);
    lossPercent.value = (100 - winPercent.value).toFixed(1);
    if (winBarRef.value) {
      const winSpan: HTMLElement = winBarRef.value.children[0] as HTMLElement;
      const lossSpan: HTMLElement = winBarRef.value.children[1] as HTMLElement;
      winSpan.style.width = `${winPercent.value}%`;
      lossSpan.style.width = `${lossPercent.value}%`;
    }
  }
});


function changeToGameCount() {
  if (stats.value && winBarRef.value) {
    const losses = (stats.value.game_count - stats.value.win_count)
    winBarRef.value.children[0].innerHTML = winPercent.value > 0 ? `${stats.value.win_count ?? 0} ${stats.value.win_count === 1 ? "Game" : "Games"}` : '';
    winBarRef.value.children[1].innerHTML = lossPercent.value > 0 ? `${losses} ${stats.value.win_count === 0 ? "Game" : "Games"}` : '';
  }
}

function changeToWinPercent() {
  if (stats.value && winBarRef.value) {
    winBarRef.value.children[0].innerHTML = winPercent.value > 0 ? `${winPercent.value}%` : '';
    winBarRef.value.children[1].innerHTML = lossPercent.value > 0 ? `${lossPercent.value}%` : '';
  }
}
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
  <div v-else-if="user !== null" class="w-full h-full flex flex-col items-center gap-y-8">
    <div class="justify-center flex flex-col items-center gap-y-4">
      <img :src="user.photoURL || ''" class="w-[40vw] h-[40vw] md:w-[10vw] md:h-[10vw] rounded-full" />
      <div class="flex gap-x-2 w-full justify-center items-center">
        <h1 class="text-black font-bold text-xl">{{ user.displayName }}</h1>
        <button @click="logout" class="flex justify-center items-center border border-red font-medium rounded-lg py-1 px-2
          gap-x-2 transition-all duration-200 ease-in-out text-red ">
          Logout
          <!-- <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" /> -->
        </button>
      </div>
    </div>
    <hr v-if="stats !== null" class="border-gray-400 w-full max-w-[500px]" />
    <div v-if="stats !== null"
      class="w-[300px] md:w-[500px] h-full flex flex-col gap-y-4 justify-center items-center font-light text-black">
      <div class="gap-y-1 container-col-start w-full">
        <div ref="win-bar" @mouseenter="changeToGameCount" @mouseleave="changeToWinPercent"
          class="w-full flex justify-start items-center border-2 rounded-lg overflow-hidden">
          <span class="py-2 h-full flex justify-center items-center bg-black text-white">{{ winPercent }}%</span>
          <span class="py-2 h-full flex justify-center items-center">{{ lossPercent }}%</span>
        </div>
        <div class="flex w-full justify-between items-center">
          <span class="font-light text-sm">WIN</span>
          <span class="font-light text-sm">LOSS</span>
        </div>
      </div>
      <Bar :height="200" id="guesses-count-chart" :options="guessesChartOptions" :data="guessesChartData" />
    </div>
  </div>
</template>
