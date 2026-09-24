import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Restores the saved session before any protected query runs.
 * Only an explicit sign-out clears the user, so a temporary network
 * failure after the device wakes up never logs anyone out.
 */
export function useAuthReady() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) setUser(session.user);
      else if (event === "SIGNED_OUT") setUser(null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setIsReady(true);
    });

    // Refresh the token as soon as the device/app comes back.
    const onVisible = () => {
      if (document.visibilityState === "visible") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, []);

  return { user, isReady };
}
