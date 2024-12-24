<script setup lang="ts">
const props = defineProps(['_athlete', 'athlete'])
import { areAthletesEqual, calculateAge, calculateHeightInches } from "@/stores/firestore";
</script>
<template>
  <div class="pointer-events-none rounded-xl flex flex-col w-full h-fit bg-white md:bg-transparent md:flex-row">
    <div :class='{ "text-green": areAthletesEqual(_athlete, athlete) }' class="w-full md:w-1/6 flex justify-center items-center py-4 font-bold">
      {{ _athlete.full_name }}
    </div>
    <div class="w-full md:w-5/6 flex justify-center items-center min-h-[75px] h-[75px] md:bg-white md:rounded-xl">
      <div
        :class='{ "border-y-green border-l-green text-green": _athlete.league === athlete.league, "border-y-red border-l-red text-red": _athlete.league !== athlete.league }'
        class="text-sm h-full font-medium py-4 rounded-bl-xl md:rounded-tl-xl w-full flex justify-center items-center gap-x-2 border-y-2 border-l-2 border-white">
        {{ _athlete.league }}</div>
      <div
        :class='{ "border-y-green text-green": _athlete.team === athlete.team, "border-y-red text-red": _athlete.team !== athlete.team }'
        class="text-sm font-medium h-full w-full flex justify-center items-center gap-x-2 border-y-2 border-white text-center">
        {{ _athlete.team }}</div>
      <div
        :class='{ "border-y-green text-green": _athlete.position === athlete.position, "border-y-red text-red": _athlete.position !== athlete.position }'
        class="text-sm font-medium h-full w-full flex justify-center items-center gap-x-2 border-y-2 border-white">
        {{ _athlete.position }}</div>
      <div
        :class='{ "border-y-green text-green": calculateAge(_athlete.dob) === calculateAge(athlete.dob), "border-y-yellow text-yellow": calculateAge(_athlete.dob) !== calculateAge(athlete.dob) }'
        class="text-sm font-medium h-full w-full flex justify-center items-center gap-x-2 border-y-2 border-white">
        {{ calculateAge(_athlete.dob) }}
        <font-awesome-icon v-if="calculateAge(_athlete.dob) !== calculateAge(athlete.dob)"
          :class='{ "rotate-180": calculateAge(_athlete.dob) > calculateAge(athlete.dob) }' icon='arrow-up' class="text-black" />
      </div>
      <div
        :class='{ "border-y-green border-r-green text-green": calculateHeightInches(_athlete.height_feet, _athlete.height_inches) === calculateHeightInches(athlete.height_feet, athlete.height_inches), "border-y-yellow border-r-yellow text-yellow": calculateHeightInches(_athlete.height_feet, _athlete.height_inches) !== calculateHeightInches(athlete.height_feet, athlete.height_inches) }'
        class="md:rounded-tr-xl text-sm font-medium h-full rounded-br-xl w-full flex justify-center items-center gap-x-2 border-y-2 border-r-2 border-white">
        {{ _athlete.height_feet }}'{{ _athlete.height_inches }}"
        <font-awesome-icon
          v-if="calculateHeightInches(_athlete.height_feet, _athlete.height_inches) !== calculateHeightInches(athlete.height_feet, athlete.height_inches)"
          :class='{ "rotate-180": calculateHeightInches(_athlete.height_feet, _athlete.height_inches) > calculateHeightInches(athlete.height_feet, athlete.height_inches) }'
          icon='arrow-up' class="text-black" />
      </div>
    </div>
  </div>
</template>
