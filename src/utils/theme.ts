import { Theme } from "@/store/useSettingsStore";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  let activeTheme = theme;

  if (theme === "system") {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    activeTheme = systemPrefersDark ? "dark" : "light";
  }

  root.setAttribute("data-theme", activeTheme);

  if (activeTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Update theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", activeTheme === "light" ? "#F9FAFB" : "#222831");
  }
}

import { storage } from "@/lib/storage";

export function initThemeListener() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = () => {
    try {
      // Try new storage manager first
      const pulseSettings = localStorage.getItem("pulse-settings") || localStorage.getItem("relift_settings");
      if (pulseSettings) {
        const settings = JSON.parse(pulseSettings);
        if (settings?.state?.theme === "system") {
          applyTheme("system");
        }
      } else {
        // Fallback via storage manager if needed
        applyTheme("system");
      }
    } catch {
      // ignore
    }
  };

  // passive listener for performance
  mediaQuery.addEventListener("change", handleChange, { passive: true } as any);
  return () => mediaQuery.removeEventListener("change", handleChange);
}
