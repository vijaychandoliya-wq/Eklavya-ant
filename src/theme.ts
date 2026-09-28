/**
 * Ant Design Mobile design tokens + app theme (light / dark / system).
 *
 * Values mirror Ant Design Mobile's `theme-default.less` (`--adm-color-*`)
 * rather than Ant Design desktop, so this app and the Android client render the
 * same design system. Do not hand-pick new colours in screens — add a token
 * here and use it, otherwise the two clients drift apart.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppColors = typeof colorsLight;

export const THEME_STORAGE_KEY = 'eklavya.parent.theme';

export const colorsLight = {
  // Brand
  primary: '#1677ff',
  primaryTap: '#0958d9',

  // Semantic
  success: '#00b578',
  warning: '#ff8f1f',
  danger: '#ff3141',

  // Text
  text: '#333333',
  textSecondary: '#666666',
  weak: '#999999',
  light: '#cccccc',

  // Surfaces
  border: '#eeeeee',
  surface: '#ffffff',
  background: '#f5f5f5',
  wathet: '#e7f1ff',

  // Accents used for category chips and stat tiles.
  violet: '#722ed1',
  cyan: '#13c2c2',
  magenta: '#eb2f96',

  // Shell accents
  drawerHeaderBg: '#f0f5ff',
  drawerHeaderBorder: '#adc6ff',
  dangerSoftBg: '#fff1f0',
  dangerSoftBorder: '#ffccc7',
  dangerTagBorder: '#ffa39e',
} as const;

export const colorsDark: {[K in keyof typeof colorsLight]: string} = {
  primary: '#1677ff',
  primaryTap: '#3c89ff',

  success: '#00b578',
  warning: '#ff8f1f',
  danger: '#ff4d4f',

  // WCAG AA vs surface (#1f1f1f): text ~15:1, secondary ~9:1, weak ~6.5:1
  text: '#f5f5f5',
  textSecondary: '#c2c2c2',
  weak: '#a3a3a3',
  light: '#8c8c8c',

  border: '#303030',
  surface: '#1f1f1f',
  background: '#141414',
  wathet: '#111a2c',

  violet: '#9254de',
  cyan: '#36cfc9',
  magenta: '#f759ab',

  drawerHeaderBg: '#111a2c',
  drawerHeaderBorder: '#15395b',
  dangerSoftBg: '#2a1215',
  dangerSoftBorder: '#58181c',
  dangerTagBorder: '#a61d24',
};

/** Default / fallback for screens that still import a static palette (light). */
export const colors = colorsLight;

/**
 * Ant Design Mobile ships exactly three radii. Anything else is a deviation.
 */
export const radius = {s: 4, m: 8, l: 12} as const;

/**
 * Ant Design Mobile's type scale. Main body text is `main`.
 */
export const font = {
  xxs: 9,
  xs: 10,
  s: 11,
  ms: 12,
  main: 13,
  m: 14,
  l: 15,
  xl: 16,
  xxl: 17,
  huge: 18,
} as const;

export const spacing = {xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32} as const;

/**
 * Build Ant Design Mobile `<Provider theme>` tokens from the active palette.
 */
export function makeAntdTheme(palette: AppColors | typeof colorsDark) {
  return {
    brand_primary: palette.primary,
    brand_primary_tap: palette.primaryTap,
    brand_success: palette.success,
    brand_warning: palette.warning,
    brand_error: palette.danger,
    color_text_base: palette.text,
    color_text_secondary: palette.textSecondary,
    color_text_placeholder: palette.light,
    color_text_caption: palette.weak,
    color_text_paragraph: palette.text,
    color_text_disabled: palette.light,
    color_icon_base: palette.weak,
    color_link: palette.primary,
    border_color_base: palette.border,
    border_color_thin: palette.border,
    fill_base: palette.surface,
    fill_body: palette.background,
    fill_tap: palette.border,
    fill_grey: palette.background,
    tab_bar_fill: palette.surface,
    search_bar_fill: palette.background,
    radius_md: radius.m,
    radius_lg: radius.l,
  };
}

/** @deprecated Prefer makeAntdTheme(useAppTheme().colors) — light-only snapshot. */
export const antdTheme = makeAntdTheme(colorsLight);

/**
 * Maps a free-text status from the API onto a semantic colour.
 *
 * The teacher API is inconsistent about casing and wording across modules
 * (`Approved`, `approved`, `Pass`, `completed`, `active`), so match loosely and
 * fall back to warning — an unrecognised status is nearly always "in progress".
 */
export function statusColor(
  status?: string | null,
  palette: AppColors | typeof colorsDark = colorsLight,
): string {
  const value = String(status || '').toLowerCase();
  if (/(approved|completed|present|pass|published|active|done)/.test(value)) {
    return palette.success;
  }
  if (/(rejected|absent|fail|cancelled|expired|overdue)/.test(value)) {
    return palette.danger;
  }
  if (/(draft|new|open)/.test(value)) {
    return palette.primary;
  }
  return palette.warning;
}

type ThemeContextValue = {
  colors: AppColors | typeof colorsDark;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  antdTheme: ReturnType<typeof makeAntdTheme>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  mode: ThemeMode,
  system: string | null | undefined,
): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({children}: {children: ReactNode}) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(stored => {
        if (cancelled) {
          return;
        }
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .catch(() => {
        /* keep system default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
      /* ignore persistence failures */
    });
  }, []);

  const scheme = resolveScheme(mode, systemScheme);
  const isDark = scheme === 'dark';
  const activeColors = isDark ? colorsDark : colorsLight;
  const activeAntdTheme = useMemo(() => makeAntdTheme(activeColors), [activeColors]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: activeColors,
      isDark,
      mode,
      setMode,
      antdTheme: activeAntdTheme,
    }),
    [activeColors, isDark, mode, setMode, activeAntdTheme],
  );

  return React.createElement(ThemeContext.Provider, {value}, children);
}

/**
 * Active theme: palette, resolved dark flag, preference mode, and setter.
 * Must be used under ThemeProvider.
 */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback for early render / tests — light tokens only.
    return {
      colors: colorsLight,
      isDark: false,
      mode: 'system',
      setMode: () => {},
      antdTheme: antdTheme,
    };
  }
  return ctx;
}

/** Convenience alias when only the palette is needed. */
export function useThemeColors() {
  return useAppTheme().colors;
}
