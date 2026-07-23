import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";

export interface SettingsStore {
  ramadanMode: boolean;
  toggleRamadanMode: () => void;
  restDuration: number;
  setRestDuration: (seconds: number) => void;
  weightUnit: "kg" | "lbs";
  setWeightUnit: (unit: "kg" | "lbs") => void;
  distanceUnit: "km" | "miles";
  setDistanceUnit: (unit: "km" | "miles") => void;
  measurementUnit: "cm" | "inches";
  setMeasurementUnit: (unit: "cm" | "inches") => void;
  firstDayOfWeek: string;
  setFirstDayOfWeek: (day: string) => void;
  timerSound: "default" | "custom";
  setTimerSound: (sound: "default" | "custom") => void;
  timerVolume: "low" | "medium" | "high";
  setTimerVolume: (vol: "low" | "medium" | "high") => void;
  timerVibration: "low" | "medium" | "high";
  setTimerVibration: (vib: "low" | "medium" | "high") => void;
  trackRpeRir: "RPE" | "RIR";
  setTrackRpeRir: (mode: "RPE" | "RIR") => void;
  prevWorkoutEval: "any" | "same";
  setPrevWorkoutEval: (mode: "any" | "same") => void;
  keepScreenAwake: boolean;
  toggleKeepScreenAwake: () => void;
  showDetailedWorkout: boolean;
  toggleShowDetailedWorkout: () => void;
  autoScrollSubsets: boolean;
  toggleAutoScrollSubsets: () => void;
  connectSpotify: boolean;
  toggleConnectSpotify: () => void;
  connectYoutubeMusic: boolean;
  toggleConnectYoutubeMusic: () => void;
  aiWorkoutRecs: boolean;
  toggleAiWorkoutRecs: () => void;
  personalRecordNotif: boolean;
  togglePersonalRecordNotif: () => void;
  isPremium: boolean;
  setPremium: (premium: boolean) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ramadanMode: false,
      toggleRamadanMode: () =>
        set((state) => ({ ramadanMode: !state.ramadanMode })),
      restDuration: 60,
      setRestDuration: (seconds) => set({ restDuration: seconds }),
      weightUnit: "kg",
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      distanceUnit: "km",
      setDistanceUnit: (unit) => set({ distanceUnit: unit }),
      measurementUnit: "cm",
      setMeasurementUnit: (unit) => set({ measurementUnit: unit }),
      firstDayOfWeek: "saturday",
      setFirstDayOfWeek: (day) => set({ firstDayOfWeek: day }),
      timerSound: "default",
      setTimerSound: (sound) => set({ timerSound: sound }),
      timerVolume: "medium",
      setTimerVolume: (vol) => set({ timerVolume: vol }),
      timerVibration: "medium",
      setTimerVibration: (vib) => set({ timerVibration: vib }),
      trackRpeRir: "RIR",
      setTrackRpeRir: (mode) => set({ trackRpeRir: mode }),
      prevWorkoutEval: "any",
      setPrevWorkoutEval: (mode) => set({ prevWorkoutEval: mode }),
      keepScreenAwake: false,
      toggleKeepScreenAwake: () =>
        set((state) => ({ keepScreenAwake: !state.keepScreenAwake })),
      showDetailedWorkout: false,
      toggleShowDetailedWorkout: () =>
        set((state) => ({ showDetailedWorkout: !state.showDetailedWorkout })),
      autoScrollSubsets: true,
      toggleAutoScrollSubsets: () =>
        set((state) => ({ autoScrollSubsets: !state.autoScrollSubsets })),
      connectSpotify: false,
      toggleConnectSpotify: () =>
        set((state) => ({ connectSpotify: !state.connectSpotify })),
      connectYoutubeMusic: false,
      toggleConnectYoutubeMusic: () =>
        set((state) => ({ connectYoutubeMusic: !state.connectYoutubeMusic })),
      aiWorkoutRecs: false,
      toggleAiWorkoutRecs: () =>
        set((state) => ({ aiWorkoutRecs: !state.aiWorkoutRecs })),
      personalRecordNotif: true,
      togglePersonalRecordNotif: () =>
        set((state) => ({ personalRecordNotif: !state.personalRecordNotif })),
      isPremium: false,
      setPremium: (premium) => set({ isPremium: premium }),
      notificationsEnabled: false,
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      theme: "system",
      setTheme: (theme) => set({ theme }),
      language: "ar",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "pulse-settings",
    }
  )
);
