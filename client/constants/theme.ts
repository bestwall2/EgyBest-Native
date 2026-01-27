import { Platform } from "react-native";

// Cinematic luxury theme - Netflix-meets-boutique-cinema aesthetic
const primaryRed = "#E50914";
const backgroundBlack = "#0A0A0A";
const surfaceDark = "#1A1A1A";
const surfaceVariant = "#2A2A2A";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#B3B3B3",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8A8A8A",
    tabIconSelected: primaryRed,
    link: primaryRed,
    primary: primaryRed,
    backgroundRoot: backgroundBlack,
    backgroundDefault: surfaceDark,
    backgroundSecondary: surfaceVariant,
    backgroundTertiary: "#3A3A3A",
    success: "#46D369",
    warning: "#FFB800",
    error: "#E50914",
    border: "#333333",
    skeleton: "#2A2A2A",
    skeletonHighlight: "#3A3A3A",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B3B3B3",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8A8A8A",
    tabIconSelected: primaryRed,
    link: primaryRed,
    primary: primaryRed,
    backgroundRoot: backgroundBlack,
    backgroundDefault: surfaceDark,
    backgroundSecondary: surfaceVariant,
    backgroundTertiary: "#3A3A3A",
    success: "#46D369",
    warning: "#FFB800",
    error: "#E50914",
    border: "#333333",
    skeleton: "#2A2A2A",
    skeletonHighlight: "#3A3A3A",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// TMDB Image sizes
export const TMDBImageSizes = {
  poster: {
    small: "w185",
    medium: "w342",
    large: "w500",
    original: "original",
  },
  backdrop: {
    small: "w300",
    medium: "w780",
    large: "w1280",
    original: "original",
  },
  profile: {
    small: "w45",
    medium: "w185",
    large: "h632",
    original: "original",
  },
};

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
