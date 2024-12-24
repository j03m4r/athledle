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
  async function getResult(): Promise<Result | null> {
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
        GUESSES.value = result.guesses;
        return result;
      }
      return null;
    } catch (error) {
      console.error("Result fetch failed:", error); // TODO :: Replace with some kind of notification like toastr
      $toast.error('Could not fetch existing user result', {
        duration: 5000
      })
      return null;
    }
  }

  async function checkIfResultExists(): Promise<boolean> {
    if (auth.user === null) return false;
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const date_str = `${year}-${month}-${day}`;

      const docRef = doc(db, "users", auth.user.uid, "results", date_str);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      $toast.error('Could not fetch existing user result', {
        duration: 5000
      })
      return false;
    }
  };

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

  return { GUESSES, ATHLETE, getAthlete, getAthletes, getResult, checkIfResultExists, syncGuesses, searchAthletes }
});
