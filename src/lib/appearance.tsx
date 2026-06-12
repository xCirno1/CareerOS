import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Appearance preferences that aren't light/dark (that stays in ThemeProvider):
 *  - `colorTheme`: re-points the brand/accent/navy CSS tokens via a
 *    `data-theme` attribute on <html>. All recoloring lives in CSS
 *    (`styles.css`) — there are no per-component conditionals.
 *  - `fontSize`: scales the root font-size via a `data-font` attribute.
 *
 * Both are applied to `document.documentElement` and persisted to localStorage.
 */

export type ColorTheme =
  | 'teal'
  | 'crimson'
  | 'violet'
  | 'emerald'
  | 'slate'
  | 'sunset'
  | 'ocean'
  | 'aurora';

export type FontSize = 12 | 14 | 15 | 16 | 18 | 20 | 24;

export type BgTheme = 'mint' | 'snow' | 'sand' | 'slate' | 'blush';

export interface BgMeta {
  id: BgTheme;
  label: string;
  /** Swatch colors (light-mode canvas + surface) for the picker preview. */
  canvas: string;
  surface: string;
  surface2: string;
}

/** Background palettes mirror the light values in styles.css. */
export const BACKGROUNDS: BgMeta[] = [
  { id: 'mint', label: 'Mint', canvas: '#e9f0ec', surface: '#ffffff', surface2: '#edf5f2' },
  { id: 'snow', label: 'Snow', canvas: '#f4f6f8', surface: '#ffffff', surface2: '#edf0f4' },
  { id: 'sand', label: 'Sand', canvas: '#f4f0e8', surface: '#fffdfa', surface2: '#f0eae0' },
  { id: 'slate', label: 'Slate', canvas: '#eaeef3', surface: '#ffffff', surface2: '#e2e8f0' },
  { id: 'blush', label: 'Blush', canvas: '#f7f0f2', surface: '#fffeff', surface2: '#f2e9ec' },
];

export interface ThemeMeta {
  id: ColorTheme;
  label: string;
  kind: 'solid' | 'gradient';
  /** Swatch colors (light-mode brand → accent) so the picker renders
   *  independent of the currently-applied theme. */
  from: string;
  to: string;
}

/** Order shown in the picker. Swatch hexes mirror the light values in styles.css. */
export const THEMES: ThemeMeta[] = [
  { id: 'teal', label: 'Teal', kind: 'solid', from: '#2f7f8f', to: '#f2b95e' },
  { id: 'crimson', label: 'Crimson', kind: 'solid', from: '#d33d54', to: '#f0a14e' },
  { id: 'violet', label: 'Violet', kind: 'solid', from: '#6d4ad1', to: '#d98ce0' },
  { id: 'emerald', label: 'Emerald', kind: 'solid', from: '#1f9d6b', to: '#f2c14e' },
  { id: 'slate', label: 'Slate', kind: 'solid', from: '#5b6b78', to: '#7c8b96' },
  { id: 'sunset', label: 'Sunset', kind: 'gradient', from: '#e06a2c', to: '#e23d6d' },
  { id: 'ocean', label: 'Ocean', kind: 'gradient', from: '#2563c0', to: '#1ba5b8' },
  { id: 'aurora', label: 'Aurora', kind: 'gradient', from: '#7b53d1', to: '#1f9d7a' },
];

export const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: 12, label: '12px' },
  { id: 14, label: '14px' },
  { id: 15, label: '15px' },
  { id: 16, label: '16px' },
  { id: 18, label: '18px' },
  { id: 20, label: '20px' },
  { id: 24, label: '24px' },
];

const THEME_IDS = THEMES.map((t) => t.id);
const BG_IDS = BACKGROUNDS.map((b) => b.id);
const FONT_IDS = FONT_SIZES.map((f) => f.id);

const THEME_KEY = 'careeros-color-theme';
const BG_KEY = 'careeros-bg-theme';
const FONT_KEY = 'careeros-font-size';
const AUTO_OPEN_CHAT_KEY = 'careeros-auto-open-chat';
const DEFAULT_THEME: ColorTheme = 'teal';
const DEFAULT_BG: BgTheme = 'mint';
const DEFAULT_FONT: FontSize = 16;
const DEFAULT_AUTO_OPEN_CHAT = false;

function loadTheme(): ColorTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_KEY) as ColorTheme | null;
  return stored && THEME_IDS.includes(stored) ? stored : DEFAULT_THEME;
}

function loadBg(): BgTheme {
  if (typeof window === 'undefined') return DEFAULT_BG;
  const stored = window.localStorage.getItem(BG_KEY) as BgTheme | null;
  return stored && BG_IDS.includes(stored) ? stored : DEFAULT_BG;
}

function loadFont(): FontSize {
  if (typeof window === 'undefined') return DEFAULT_FONT;
  const stored = window.localStorage.getItem(FONT_KEY);
  if (stored === 'sm') return 15;
  if (stored === 'md') return 16;
  if (stored === 'lg') return 18;
  const parsed = Number(stored);
  return FONT_IDS.includes(parsed as FontSize) ? (parsed as FontSize) : DEFAULT_FONT;
}

function loadAutoOpenChat(): boolean {
  if (typeof window === 'undefined') return DEFAULT_AUTO_OPEN_CHAT;
  return window.localStorage.getItem(AUTO_OPEN_CHAT_KEY) === 'true';
}

interface AppearanceStore {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  bgTheme: BgTheme;
  setBgTheme: (bg: BgTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  /** Auto-open the mentor chat window when visiting the Mentors page. */
  autoOpenChat: boolean;
  setAutoOpenChat: (value: boolean) => void;
  reset: () => void;
}

const Ctx = createContext<AppearanceStore | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(loadTheme);
  const [bgTheme, setBgThemeState] = useState<BgTheme>(loadBg);
  const [fontSize, setFontSizeState] = useState<FontSize>(loadFont);
  const [autoOpenChat, setAutoOpenChatState] = useState<boolean>(loadAutoOpenChat);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
    window.localStorage.setItem(THEME_KEY, colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bg', bgTheme);
    window.localStorage.setItem(BG_KEY, bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', String(fontSize));
    window.localStorage.setItem(FONT_KEY, String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    window.localStorage.setItem(AUTO_OPEN_CHAT_KEY, String(autoOpenChat));
  }, [autoOpenChat]);

  const setColorTheme = useCallback((theme: ColorTheme) => setColorThemeState(theme), []);
  const setBgTheme = useCallback((bg: BgTheme) => setBgThemeState(bg), []);
  const setFontSize = useCallback((size: FontSize) => setFontSizeState(size), []);
  const setAutoOpenChat = useCallback((value: boolean) => setAutoOpenChatState(value), []);
  const reset = useCallback(() => {
    setColorThemeState(DEFAULT_THEME);
    setBgThemeState(DEFAULT_BG);
    setFontSizeState(DEFAULT_FONT);
    setAutoOpenChatState(DEFAULT_AUTO_OPEN_CHAT);
  }, []);

  const value = useMemo<AppearanceStore>(
    () => ({ colorTheme, setColorTheme, bgTheme, setBgTheme, fontSize, setFontSize, autoOpenChat, setAutoOpenChat, reset }),
    [colorTheme, setColorTheme, bgTheme, setBgTheme, fontSize, setFontSize, autoOpenChat, setAutoOpenChat, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppearance(): AppearanceStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider');
  return ctx;
}
