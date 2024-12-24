<script setup lang="ts">
const props = defineProps(['_athlete', 'athlete', 'isLast']);
import { areAthletesEqual, calculateAge, calculateHeightInches } from "@/stores/firestore";
import { useTemplateRef, onMounted } from 'vue';

const hintContainer = useTemplateRef("hint-container");
const athleteName = useTemplateRef("athlete-name");

onMounted(() => {
  if (!hintContainer.value || !athleteName.value) return;
  const green = "#89aa5a";
  const red = "#802F2E";
  const yellow = "#F2C94C";
  const hints = hintContainer.value.children;

  // Name styling
  if (areAthletesEqual(props._athlete, props.athlete)) {
    setTimeout(() => {
      athleteName.value.style.color = green;
    }, props.isLast ? 3000 : 0);
  }

  // League styling
  setTimeout(() => {
    const leagueHint = hints[0];
    if (props._athlete.league === props.athlete.league) {
      leagueHint.style.borderColor = green;
      leagueHint.style.color = green;
    } else {
      leagueHint.style.borderColor = red;
      leagueHint.style.color = red;
    }
  }, props.isLast ? 500 : 0);

  // Team styling
  setTimeout(() => {
    const teamHint = hints[1];
    if (props._athlete.team === props.athlete.team) {
      teamHint.style.borderColor = green;
      teamHint.style.color = green;
    } else {
      teamHint.style.borderColor = red;
      teamHint.style.color = red;
    }
  }, props.isLast ? 1000 : 0);

  // Position styling
  setTimeout(() => {
    const positionHint = hints[2];
    if (props._athlete.position === props.athlete.position) {
      positionHint.style.borderColor = green;
      positionHint.style.color = green;
    } else {
      positionHint.style.borderColor = red;
      positionHint.style.color = red;
    }
  }, props.isLast ? 1500: 0);

  // Age styling
  setTimeout(() => {
    const ageHint = hints[3];
    if (calculateAge(props._athlete.dob) === calculateAge(props.athlete.dob)) {
      ageHint.style.borderColor = green;
      ageHint.style.color = green;
    } else {
      ageHint.style.borderColor = yellow;
      ageHint.style.color = yellow;
    }
  }, props.isLast ? 2000 : 0);

  // Height styling
  setTimeout(() => {
    const heightHint = hints[4];
    if (
      calculateHeightInches(props._athlete.height_feet, props._athlete.height_inches) ===
      calculateHeightInches(props.athlete.height_feet, props.athlete.height_inches)
    ) {
      heightHint.style.borderColor = green;
      heightHint.style.color = green;
    } else {
      heightHint.style.borderColor = yellow;
      heightHint.style.color = yellow;
    }
  }, props.isLast ? 2500 : 0);
});
</script>

<template>
  <div class="pointer-events-none rounded-xl flex flex-col w-full h-fit bg-white md:bg-transparent md:flex-row">
    <div ref="athlete-name" :class='{ "text-green": false }'
      class="transition-all duration-500 ease-in-out text-gr w-full md:w-1/6 flex justify-center items-center py-4 font-bold">
      {{ _athlete.full_name }}
    </div>
    <div ref="hint-container"
      class="w-full md:w-5/6 flex justify-center items-center min-h-[75px] h-[75px] md:bg-white md:rounded-xl">
      <div class="transition-all duration-500 ease-in-out text-sm h-full font-medium py-4 rounded-bl-xl md:rounded-tl-xl w-full flex justify-center items-center gap-x-2 border-y-2 border-l-2 border-white">
        {{ _athlete.league }}
      </div>
      <div class="transition-all duration-500 ease-in-out text-sm font-medium h-full w-full flex justify-center items-center gap-x-2 border-y-2 border-white text-center">
        {{ _athlete.team }}</div>
      <div class="transition-all duration-500 ease-in-out text-sm font-medium h-full w-full flex justify-center items-center gap-x-2 border-y-2 border-white">
        {{ _athlete.position }}</div>
      <div class="transition-all duration-500 ease-in-out text-sm font-medium h-full w-full flex justify-center items-center gap-x-2 border-y-2 border-white">
        {{ calculateAge(_athlete.dob) }}
        <font-awesome-icon v-if="calculateAge(_athlete.dob) !== calculateAge(athlete.dob)"
          :class='{ "rotate-180": calculateAge(_athlete.dob) > calculateAge(athlete.dob) }' icon='arrow-up'
          class="text-inherit" />
      </div>
      <div class="transition-all duration-500 ease-in-out md:rounded-tr-xl text-sm font-medium h-full rounded-br-xl w-full flex justify-center items-center gap-x-2 border-y-2 border-r-2 border-white">
        {{ _athlete.height_feet }}'{{ _athlete.height_inches }}"
        <font-awesome-icon
          v-if="calculateHeightInches(_athlete.height_feet, _athlete.height_inches) !== calculateHeightInches(athlete.height_feet, athlete.height_inches)"
          :class='{ "rotate-180": calculateHeightInches(_athlete.height_feet, _athlete.height_inches) > calculateHeightInches(athlete.height_feet, athlete.height_inches) }'
          icon='arrow-up' class="text-inherit" />
      </div>
    </div>
  </div>
</template>
