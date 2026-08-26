import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import AuthPromptSheet from "@/components/AuthPromptSheet";

interface SavedEventsValue {
  /** Event ids the signed-in user has saved. Empty for anonymous visitors. */
  savedIds: Set<string>;
  isSaved: (eventId: string) => boolean;
  /** Save or unsave. Anonymous taps open the auth prompt instead. */
  toggleSave: (eventId: string) => void;
  loading: boolean;
}

const SavedEventsContext = createContext<SavedEventsValue | null>(null);

/**
 * The one place saved state lives.
 *
 * Saving is reachable from three surfaces — the browse cards, the event list,
 * and the detail page — so it cannot hang off `useEvents`, which every page
 * instantiates separately: a save tapped on a card would leave the Saved tab
 * reading its own stale copy until a refetch. One provider, one query, one set
 * of ids that every surface reads and writes.
 *
 * It owns the auth prompt too. An anonymous tap on a bookmark has to ask for an
 * account rather than quietly doing nothing, and one sheet here beats one per
 * card in a scrolling feed.
 */
export const SavedEventsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setSavedIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    // Wrapped because this provider wraps every route: a backend that is
    // missing or misbehaving must degrade to "nothing saved", never take the
    // app shell down with it.
    (async () => {
      try {
        const { data } = await supabase
          .from("event_saves")
          .select("event_id")
          .eq("user_id", user.id);
        if (cancelled) return;
        setSavedIds(new Set((data ?? []).map((row) => row.event_id as string)));
      } catch {
        if (!cancelled) setSavedIds(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleSave = useCallback(
    async (eventId: string) => {
      if (!user) {
        setPromptOpen(true);
        return;
      }

      const wasSaved = savedIds.has(eventId);

      // Optimistic: the icon has to answer the tap immediately, because the
      // point of this control is pinning things while scrolling past them.
      const apply = (save: boolean) =>
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (save) next.add(eventId);
          else next.delete(eventId);
          return next;
        });

      apply(!wasSaved);

      try {
        const { error } = wasSaved
          ? await supabase
              .from("event_saves")
              .delete()
              .eq("event_id", eventId)
              .eq("user_id", user.id)
          : await supabase
              .from("event_saves")
              .insert({ event_id: eventId, user_id: user.id });

        // Roll back rather than leave a bookmark that looks saved and isn't —
        // the saved list is the whole point, so a lie here is expensive.
        if (error) apply(wasSaved);
      } catch {
        apply(wasSaved);
      }
    },
    [user, savedIds]
  );

  const value = useMemo<SavedEventsValue>(
    () => ({
      savedIds,
      isSaved: (eventId: string) => savedIds.has(eventId),
      toggleSave,
      loading,
    }),
    [savedIds, toggleSave, loading]
  );

  return (
    <SavedEventsContext.Provider value={value}>
      {children}
      <AuthPromptSheet
        open={promptOpen}
        onOpenChange={setPromptOpen}
        title="Log in to save events"
        subtitle="Create a free account to keep a list of events you like."
      />
    </SavedEventsContext.Provider>
  );
};

export function useSavedEvents(): SavedEventsValue {
  const ctx = useContext(SavedEventsContext);
  if (!ctx) {
    throw new Error("useSavedEvents must be used inside <SavedEventsProvider>");
  }
  return ctx;
}
