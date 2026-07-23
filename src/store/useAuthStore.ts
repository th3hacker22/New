import { create } from "zustand";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface GuestUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export type AuthUser = User | GuestUser | null;

interface AuthState {
  user: AuthUser;
  isLoading: boolean;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  enableGuestMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isGuest: false,
  setUser: (user) => set({ user, isGuest: false }),
  setLoading: (isLoading) => set({ isLoading }),
  enableGuestMode: () => set({ 
    isGuest: true, 
    user: { 
      uid: "guest-user", 
      displayName: "Guest Athlete", 
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
      email: "guest@example.com"
    },
    isLoading: false 
  }),
}));

// Listener
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      useAuthStore.getState().setUser(user);
    } else {
      // Automatically enable guest mode if no user found
      useAuthStore.getState().enableGuestMode();
    }
    useAuthStore.getState().setLoading(false);

    if (user) {
      import("@/services/socialService").then(({ socialService }) => {
        socialService
          .updatePublicProfile(
            user.uid,
            user.displayName || "Unknown Athlete",
            user.photoURL,
          )
          .catch(console.error);
      });
      import("@/lib/syncEngine").then(({ syncAll }) => {
        syncAll(user.uid).catch(console.error);
      });
    }
  });
} else {
  useAuthStore.getState().setLoading(false);
}
