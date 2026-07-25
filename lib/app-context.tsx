"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Tradition } from "@/lib/types";
import {
  DEFAULT_LOCAL_LANGUAGE,
  STORAGE_KEY_LANGUAGE,
  isLocalLanguageId,
  type LocalLanguageId,
} from "@/lib/languages";

const TRADITION_KEY = "dawuro_tradition";

type AppContextValue = {
  language: LocalLanguageId;
  setLanguage: (id: LocalLanguageId) => void;
  tradition: Tradition;
  setTradition: (t: Tradition) => void;
  /**
   * True once stored preferences have been applied after mount.
   * Data-fetching components wait for this so the first request uses the
   * user's real language instead of the server default.
   */
  hydrated: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

function loadTradition(): Tradition {
  if (typeof window === "undefined") return "evangelical";
  try {
    const v = window.localStorage.getItem(TRADITION_KEY);
    if (v === "catholic" || v === "mainline" || v === "evangelical") return v;
  } catch {
    /* ignore */
  }
  return "evangelical";
}

function loadLanguage(): LocalLanguageId {
  if (typeof window === "undefined") return DEFAULT_LOCAL_LANGUAGE;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (isLocalLanguageId(v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCAL_LANGUAGE;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LocalLanguageId>(
    DEFAULT_LOCAL_LANGUAGE,
  );
  const [tradition, setTraditionState] = useState<Tradition>("evangelical");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLanguageState(loadLanguage());
    setTraditionState(loadTradition());
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((id: LocalLanguageId) => {
    setLanguageState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY_LANGUAGE, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setTradition = useCallback((t: Tradition) => {
    setTraditionState(t);
    try {
      window.localStorage.setItem(TRADITION_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, tradition, setTradition, hydrated }),
    [language, setLanguage, tradition, setTradition, hydrated],
  );

  // Children render immediately (server HTML included) with the default
  // language; stored preferences apply after mount. Initial client state
  // matches the server render, so there is no hydration mismatch.
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
