<script setup lang="ts">
import ColumnList from "../components/ColumnList.vue"
import AthleteGuess from "../components/AthleteGuess.vue"
import { ref, onMounted, watch, useTemplateRef } from 'vue'
import { useFirestoreStore, type Athlete, areAthletesEqual } from '@/stores/firestore'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from "@/stores/modal"
import { storeToRefs } from 'pinia'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

const modal = useModalStore();
const { isOpen } = storeToRefs(modal);
const { setOpen, setResult } = modal;

const auth = useAuthStore();
const { user } = storeToRefs(auth);
const { login } = auth;

const firestore = useFirestoreStore();
const { GUESSES, ATHLETE } = storeToRefs(firestore);
const { getAthlete, getAthletes, getResult, syncGuesses, searchAthletes } = firestore;
const inputRef = useTemplateRef("input");

const athlete = ref<Athlete | null>(null);
const athletes = ref<Athlete[]>([]);
const guesses = ref<Athlete[]>([]);
const name_query = ref<string>("");
const isDropdownOpen = ref<boolean>(false);
const isLoading = ref<boolean>(true);
const color = ref("#3B3636")

onMounted(async () => {
    if (ATHLETE.value === null) {
        athlete.value = await getAthlete();
    } else {
        athlete.value = ATHLETE.value;
    }
    athletes.value = await getAthletes();

    if (GUESSES.value.length == 0) {
        const result = await getResult();
        if (result) {
            guesses.value = result.guesses
            const guesses_names = result.guesses.map((athlete) => athlete.full_name);
            athletes.value = athletes.value.filter((athlete) => !guesses_names.includes(athlete.full_name))

            if (result.result === "win") {
                setResult("win");
                setOpen(true);
            } else if (result.result === "loss") {
                setResult("loss");
                setOpen(true);
            }
        }
    } else {
        guesses.value = GUESSES.value;
        const guesses_names = GUESSES.value.map((athlete) => athlete.full_name);
        athletes.value = athletes.value.filter((athlete) => !guesses_names.includes(athlete.full_name))
    }
    isLoading.value = false;
});

watch(name_query, (new_query) => {
    athletes.value = searchAthletes(new_query, guesses.value.map((athlete) => athlete.full_name));
});

watch(GUESSES, (newGuesses) => {
    guesses.value = GUESSES.value;
})

function onBlur() {
    setTimeout(() => isDropdownOpen.value = false, 100)
}

function selectAthlete(idx: number) {
    if (athlete === null) return;
    guesses.value.push(athletes.value[idx]);
    const guesses_names = guesses.value.map((athlete) => athlete.full_name);
    athletes.value = athletes.value.filter((athlete) => !guesses_names.includes(athlete.full_name))

    if (areAthletesEqual(guesses.value[guesses.value.length - 1], athlete.value)) {
        setTimeout(() => {
            setResult("win");
            setOpen(true);
        }, 3500);
    } else if (guesses.value.length >= 8) {
        setTimeout(() => {
            setResult("loss");
            setOpen(true);
        }, 3500);
    }

    syncGuesses(guesses.value);
    if (inputRef.value) {
        inputRef.value.blur();
        isDropdownOpen.value = false;
    }
}
</script>
<template>
    <div v-if="isLoading" class="w-full flex justify-center items-center h-[20vh]">
        <pulse-loader :loading="true" :color="color"></pulse-loader>
    </div>
    <div v-else class="w-full flex flex-col items-center gap-y-8">
        <div v-if="!((guesses.length > 0 && athlete && guesses[guesses.length - 1].full_name === athlete.full_name) || guesses.length >= 8)"
            class="flex flex-col w-full justify-start items-center">
            <div class="relative w-full">
                <input type="text" v-model="name_query" placeholder="Search athletes" @focus="isDropdownOpen = true" @blur="onBlur" @keydown.enter="selectAthlete(0)"
                    class="focus:outline-none focus:rounded-b-none placeholder:text-gray-400 px-10 py-5 rounded-lg w-full" ref="input" />
                <font-awesome-icon icon="magnifying-glass" class="absolute left-4 top-6 text-gray-400" />
                <div v-if="isDropdownOpen"
                    class="overflow-y-scroll px-2 absolute bottom-0 translate-y-full w-full max-h-[20vh] md:max-h-[30vh] bg-white rounded-b-lg z-20">
                    <div v-for="(athlete, idx) in athletes" :key="idx" @click="selectAthlete(idx)"
                        class="px-8 py-4 border border-white hover:border-black z-30 rounded-lg cursor-pointer">{{
                            athlete.full_name }}</div>
                </div>
            </div>
        </div>
        <ColumnList v-if="guesses.length > 0">
            <div class="flex w-full">
                <p class="text-sm font-light w-full justify-center items-center hidden md:flex">Athlete</p>
                <p class="text-sm font-light w-full flex justify-center items-center">League</p>
                <p class="text-sm font-light w-full flex justify-center items-center">Team</p>
                <p class="text-sm font-light w-full flex justify-center items-center">Position</p>
                <p class="text-sm font-light w-full flex justify-center items-center">Age</p>
                <p class="text-sm font-light w-full flex justify-center items-center">Height</p>
            </div>
            <AthleteGuess v-for="(_athlete, idx) in guesses" :key="idx" :isLast="idx === guesses.length - 1"
                :_athlete="_athlete" :athlete="athlete" />
        </ColumnList>
        <div class="flex flex-col items-center gap-y-2">
            <p v-if="guesses.length === 0" class="font-extralight w-fit">Guess the athlete of the day!</p>
            <p v-else class="font-extralight w-fit">Guess {{ guesses.length }} of 8</p>
            <p v-if="user === null" class="font-extralight w-fit">
                <button @click="login" class="underline">Login</button>
                to save results
            </p>
        </div>
    </div>
</template>
