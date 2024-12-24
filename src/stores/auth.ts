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
import { useToast } from 'vue-toast-notification';

/*
  * Pinia store for global access to firebase authentication data and utilities
  * */
export const useAuthStore = defineStore('auth', () => {
  const firebase = useFirebaseStore();
  const firestore = useFirestoreStore();
  const auth = getAuth(firebase.app);
  const $toast = useToast();

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
        } else {
          firestore.getResult();
        }
        $toast.success('Successfully logged in', {
          duration: 5000
        })
        return true;
      }
      return false;
    } catch (error) {
      $toast.error('Failed to login', {
        duration: 5000
      })
      return false;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      $toast.error('Failed to logout', {
        duration: 5000
      })
      return false;
    }

    // Unsubscribe from listening to onAuthStateChanged
    if (authUnsubscribe.value) {
      authUnsubscribe.value();
      authUnsubscribe.value = null;
    }

    // Ensure user state is null after logout
    user.value = null;
    firestore.GUESSES = [];
    $toast.success('Successfully logged out', {
      duration: 5000
    })
    return true;
  }

  return { user, initAuth, ensureInitialized, login, logout }
});
