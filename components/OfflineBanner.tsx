"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight offline notice — keeps the UI honest on slow/spotty networks.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function sync() {
      setOffline(!navigator.onLine);
    }
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="bg-ink px-4 py-2 text-center text-xs font-medium text-gold-soft"
      role="status"
    >
      You&apos;re offline. Cached content may still show; new verses need a
      connection.
    </div>
  );
}
