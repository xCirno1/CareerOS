import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { TARGET_NODE_ID } from '@/lib/mockData';

/**
 * Lightweight client-side app state for the dashboard: which roles the user has
 * saved, recently visited, and the career target they're routing toward.
 * Saved roles + target persist to localStorage so the dashboard feels real.
 */
interface AppStore {
  saved: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => boolean; // returns the new saved state
  recents: string[];
  addRecent: (id: string) => void;
  target: string;
  setTarget: (id: string) => void;
}

const Ctx = createContext<AppStore | null>(null);
const SAVED_KEY = 'careeros-saved';
const TARGET_KEY = 'careeros-target';

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>(loadSaved);
  const [recents, setRecents] = useState<string[]>([]);
  const [target, setTargetState] = useState<string>(
    () => localStorage.getItem(TARGET_KEY) || TARGET_NODE_ID,
  );

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const toggleSaved = useCallback((id: string) => {
    let nowSaved = false;
    setSaved((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      nowSaved = true;
      return [id, ...prev];
    });
    return nowSaved;
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecents((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 6));
  }, []);

  const setTarget = useCallback((id: string) => {
    setTargetState(id);
    localStorage.setItem(TARGET_KEY, id);
  }, []);

  return (
    <Ctx.Provider value={{ saved, isSaved, toggleSaved, recents, addRecent, target, setTarget }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
