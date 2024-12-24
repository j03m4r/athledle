import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { useFirebaseStore } from './firebase';
import { useFirestoreStore } from './firestore';

/*
  * Pinia store for global access to firebase authentication data and utilities
  * */
export const useAuthStore = defineStore('auth', () => {
  const firebase = useFirebaseStore();
  const firestore = useFirestoreStore();
  const auth = getAuth(firebase.app);

  const user = ref<User | null>(null);
  const authUnsubscribe = ref<Unsubscribe | null>(null);

  async function initAuth() {
    // Ensure auth is ready to be used
    await auth.authStateReady();

    // Set the user value to the auth's current user (User or null) and watch for auth changes
    user.value = auth.currentUser;
    authUnsubscribe.value = onAuthStateChanged(auth, async (_user) => {
      user.value = _user;
    })
  }

  async function ensureInitialized() {
    await auth.authStateReady();
    user.value = auth.currentUser;
  }

  async function login() {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        user.value = res.user;
        const resultExists = await firestore.checkIfResultExists();
        if (firestore.GUESSES.length > 0 && !resultExists) {
          firestore.syncGuesses(firestore.GUESSES)
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error); // TODO :: Replace with some kind of notification like toastr
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to logout:", error); // TODO :: Replace with some kind of notification like toastr
      return false;
    }

    // Unsubscribe from listening to onAuthStateChanged
    if (authUnsubscribe.value) {
      authUnsubscribe.value();
      authUnsubscribe.value = null;
    }

    // Ensure user state is null after logout
    user.value = null;
    return true;
  }

  return { user, initAuth, ensureInitialized, login, logout }
});
