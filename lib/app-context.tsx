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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLanguageState(loadLanguage());
    setTraditionState(loadTradition());
    setReady(true);
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
    () => ({ language, setLanguage, tradition, setTradition }),
    [language, setLanguage, tradition, setTradition],
  );

  // Avoid hydration mismatch flashes
  if (!ready) {
    return (
      <AppContext.Provider value={value}>
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-soft">
          Opening Dawuro…
        </div>
      </AppContext.Provider>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
