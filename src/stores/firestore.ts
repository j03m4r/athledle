import { defineStore } from 'pinia'
import { useAuthStore } from './auth.ts';
import { useFirebaseStore } from './firebase.ts';
import { ref } from 'vue';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';
import Fuse from 'fuse.js';
import { useToast } from 'vue-toast-notification';

export type Athlete = {
  full_name: string;
  team: string;
  first_name: string;
  last_name: string;
  dob: string;
  experience: number;
  height_feet: number;
  height_inches: number;
  weight: number;
  league: string;
  college: string;
  position: string;
};

export type Result = {
  result: string;
  guesses: Athlete[];
};

export type Stats = {
  game_count: number;
  win_count: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
};

export function areAthletesEqual(athlete1: Athlete | null, athlete2: Athlete | null): boolean {
  if (athlete2 === null || athlete1 === null) return false;
  return athlete1.full_name === athlete2.full_name &&
    athlete1.team === athlete2.team;
}

function sortAthletesAlphabetically(athletes: Athlete[]): Athlete[] {
  return athletes.sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function calculateAge(birthDate: string) {
  const today = new Date();
  const birthDateObj = new Date(birthDate);

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  return age;
}

export function calculateHeightInches(heightFeet: number, heightInches: number) {
  return 12 * heightFeet + heightInches;
}

/*
  * Pinia store for global access to Firestore
  * */
export const useFirestoreStore = defineStore('firestore', () => {
  const firebase = useFirebaseStore();
  const auth = useAuthStore()
  const db = getFirestore(firebase.app);
  const $toast = useToast();
  let athletes = [] as Athlete[]

  const GUESSES = ref<Athlete[]>([]);
  const ATHLETE = ref<Athlete | null>(null);
  const STATS = ref<Stats | null>(null);

  const fuse = new Fuse([] as Athlete[], {
    keys: ['full_name'],
  });

  /*
   * Fetches athlete of the day from Firestore.
   */
  async function getAthlete(): Promise<Athlete | null> {
    try {
      let athlete: Athlete | null = null;

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const date_str = `${year}-${month}-${day}`;
      const athlete_ref = doc(db, "athletes", date_str);
      const athlete_doc_snap = await getDoc(athlete_ref);
      if (athlete_doc_snap.exists()) {
        athlete = athlete_doc_snap.data() as Athlete;
        ATHLETE.value = athlete;
        return athlete;
      }
      return null;
    } catch (error) {
      $toast.error('Athlete fetch failed', {
        duration: 5000
      })
      throw error;
    }
  }

  /*
   * Fetches all athletes from Firestore ordered alphabetically.
   * Uses cache if data is already available for the given query.
   * @param name (optional): name of the athlete to filter by
   */
  async function getAthletes(): Promise<Athlete[]> {
    try {
      let _athletes: Athlete[] = [];

      const response = await fetch('/athletes_full.json');
      if (!response.ok) {
        athletes = _athletes;
        return _athletes;
      }
      const data = await response.json();
      _athletes = data as Athlete[];
      athletes = sortAthletesAlphabetically(_athletes);
      fuse.setCollection(_athletes);
      return _athletes;
    } catch (error) {
      $toast.error('Athletes fetch failed', {
        duration: 5000
      })
      return [];
    }
  }

  /*
   * Fetches the user's result (athlete guesses) for the current day.
   */
  async function getResult(cache: boolean): Promise<Result | null> {
    if (auth.user === null) return null;
    try {
      let result: Result | null = null;

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const date_str = `${year}-${month}-${day}`;
      const result_ref = doc(db, "users", auth.user.uid, "results", date_str);
      const result_doc_snap = await getDoc(result_ref);
      if (result_doc_snap.exists()) {
        result = result_doc_snap.data() as Result;
        if (cache) {
          GUESSES.value = result.guesses;
        }
        return result;
      }
      return null;
    } catch (error) {
      $toast.error('Could not fetch existing user result', {
        duration: 5000
      })
      return null;
    }
  }

  async function writeStat(result: Result): Promise<boolean> {
    if (auth.user === null || result.result === "incomplete") return false; // No point in writing stats: no user or user hasn't achieved win or loss for today
    const res = await getResult(false);
    if (res && (res.result === "win" || res.result === "loss")) {
      // In this case, we've already written a win/loss result to the db in the past for this day so
      // stats should have already been written because when a win or loss is FIRST achieved for the day we should write stats
      return false;
    } else if (result.result === "win" || result.result === "loss") {
      // Win or loss result hasn't been written YET. Either there doesn't exist a document yet
      // or it was previously an "incomplete" result
      const stats_ref = doc(db, "users", auth.user.uid, "profile", "stats");
      const stats_doc_snap = await getDoc(stats_ref);

      const guess_num = result.guesses.length;
      if (stats_doc_snap.exists()) {
        STATS.value = stats_doc_snap.data() as Stats;
        STATS.value = {
          ...STATS.value,
          game_count: STATS.value.game_count + 1,
          win_count: STATS.value.win_count + (result.result === "win" ? 1 : 0),
          [guess_num]: STATS.value[guess_num] + (result.result === "win" ? 1 : 0)
        };
        await updateDoc(stats_ref, STATS.value);
      } else {
        STATS.value = {
          game_count: 1,
          win_count: result.result === "win" ? 1 : 0,
          1: guess_num === 1 ? 1 : 0,
          2: guess_num === 2 ? 1 : 0,
          3: guess_num === 3 ? 1 : 0,
          4: guess_num === 4 ? 1 : 0,
          5: guess_num === 5 ? 1 : 0,
          6: guess_num === 6 ? 1 : 0,
          7: guess_num === 7 ? 1 : 0,
          8: guess_num === 8 && result.result === "win" ? 1 : 0
        };
        await setDoc(stats_ref, STATS.value);
      }

      return true;
    }

    return false;
  }

  async function getStats(): Promise<Stats | null> {
    if (auth.user === null) return null;
    const stats_ref = doc(db, "users", auth.user.uid, "profile", "stats");
    const stats_doc_snap = await getDoc(stats_ref);
    if (stats_doc_snap.exists()) {
      STATS.value = stats_doc_snap.data() as Stats;
      return STATS.value;
    }
    return null;
  }

  async function syncGuesses(guesses: Athlete[]): Promise<boolean> {
    GUESSES.value = guesses;
    if (auth.user === null || ATHLETE.value === null) return false;
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const date_str = `${year}-${month}-${day}`;

      const result =
        areAthletesEqual(guesses[guesses.length - 1], ATHLETE.value)
          ? "win"
          : guesses.length >= 8
            ? "loss"
            : "incomplete";

      await writeStat(({ result: result, guesses: guesses } as Result));
      const docRef = doc(db, "users", auth.user.uid, "results", date_str);

      await setDoc(docRef, {
        result,
        guesses: arrayUnion(...guesses),
      });

      return true;
    } catch (error) {
      $toast.error('Error syncing guesses', {
        duration: 5000
      })
      return false;
    }
  }

  /*
   * Fetches all athletes from Firestore ordered alphabetically.
   * Uses cache if data is already available for the given query.
   * @param name (optional): name of the athlete to filter by
   */
  function searchAthletes(full_name: string, guesses: string[]): Athlete[] {
    if (full_name == "") return athletes
    const _athletes = fuse.search(full_name).map((result) => result.item) as Athlete[];
    return _athletes.filter((athlete) => !guesses.includes(athlete.full_name));
  }

  return { GUESSES, ATHLETE, getAthlete, getAthletes, getResult, getStats, syncGuesses, searchAthletes }
});
