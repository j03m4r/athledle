<script setup>
import ConfettiExplosion from "vue-confetti-explosion";
import { useModalStore } from '@/stores/modal';
import { useFirestoreStore, areAthletesEqual, calculateAge, calculateHeightInches } from "@/stores/firestore";
import { storeToRefs } from 'pinia';
import { useToast } from 'vue-toast-notification';

const modal = useModalStore();
const { isOpen, result } = storeToRefs(modal);
const { setOpen } = modal;

const firestore = useFirestoreStore();
const { ATHLETE, GUESSES } = storeToRefs(firestore);

const $toast = useToast();

function generateShare() {
  let shareStr = '';
  const keys = ['league', 'team', 'position', 'age', 'height']
  GUESSES.value.forEach(guess => {
    const ans = ATHLETE.value;
    const athleteKeys = Object.keys(ans);

    keys.forEach(key => {
      if (key === "age") {
        if (calculateAge(guess.dob) === calculateAge(ans.dob)) {
          shareStr += "🟩"
        } else {
          shareStr += "🟨"
        }
      } else if (key === "height") {
        if (calculateHeightInches(guess.height_feet, guess.height_inches) === calculateHeightInches(ans.height_feet, ans.height_inches)) {
          shareStr += "🟩"
        } else {
          shareStr += "🟨"
        }
      } else {
        if (guess[key] === ans[key]) {
          shareStr += "🟩"
        } else {
          shareStr += "🟥"
        }
      }
    })

    shareStr += "\n";
  });

  return shareStr
}

async function share() {
  const shareContent = {
    text: generateShare() + `Athledle in ${areAthletesEqual(GUESSES[GUESSES.value.length-1], ATHLETE.value) ? GUESSES.value.length : "X"}/8`
  }
  if (navigator.share) {
    navigator
      .share(shareContent)
      .then(() => {
        $toast.success('Successfully shared content', {
          duration: 5000
        })
      })
      .catch((error) => {
        $toast.error('Failed to share content', {
          duration: 5000
        })
      });
  } else {
    $toast.error('Sharing is unsupported in this browser', {
      duration: 5000
    })
  }
}
</script>
<template>
  <ConfettiExplosion v-if="result === 'win'" />
  <div v-if="isOpen" @click="setOpen(false)"
    class="z-40 bg-black bg-opacity-50 w-screen h-full flex justify-center items-start px-8 pt-16 md:pt-24 absolute left-0 top-0">
    <div @click.stop class="items-start p-8 z-50 w-full max-w-[500px] h-fit bg-white rounded-xl flex flex-col gap-y-4">
      <div class="flex w-full justify-end">
        <font-awesome-icon @click="setOpen(false)" icon="x" class="text-black cursor-pointer" />
      </div>
      <div class="h-full w-full flex flex-col gap-y-4 justify-start items-center">
        <h1 v-if="result === 'win'" class="font-bold text-4xl text-green">Yay!</h1>
        <h1 v-else-if="result === 'loss'" class="font-bold text-4xl text-red">Shoot</h1>
        <p v-if="result === 'win'" class="font-light text-black">You guessed the Athledle!</p>
        <p v-else-if="result === 'loss'" class="font-light text-black">You'll get it tomorrow!</p>
        <div class="h-full w-full flex flex-col justify-center items-center">
          <!-- <h1 class="font-bold text-4xl text-black">{{ ATHLETE.full_name }}</h1> -->
          <h1 class="font-semibold text-black">{{ ATHLETE.full_name }}</h1>
          <pre class="text-2xl">{{ generateShare() }}</pre>
          <h1 class="font-semibold text-black">{{ GUESSES.length }}/8 Guesses</h1>
        </div>
      </div>
      <div class="w-full flex gap-x-2">
        <button @click="share" class="flex justify-center items-center border border-black font-medium text-black rounded-lg py-3 px-6
          w-full gap-x-2 hover:border-green transition-all duration-200 ease-in-out hover:text-green">
          Share
          <font-awesome-icon :icon="['fas', 'share']" />
        </button>
        <RouterLink @click="setOpen(false)" to='/profile'
          class="text-center border border-black font-medium text-black rounded-lg py-3 px-6 w-full hover:border-green transition-all duration-200 ease-in-out hover:text-green">
          Go to Profile
        </RouterLink>
      </div>
    </div>
  </div>
</template>
