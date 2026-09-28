export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark",
	AUTO_MODE = "auto";
export const DEFAULT_THEME = AUTO_MODE;

// Interface style: "flat" is the original look and the default,
// "neu" opts into the neumorphic (soft-UI) layer in src/styles/neumorphic.css
export type UI_STYLE = "flat" | "neu";
export const UI_STYLE_FLAT: UI_STYLE = "flat";
export const UI_STYLE_NEU: UI_STYLE = "neu";
export const DEFAULT_UI_STYLE: UI_STYLE = UI_STYLE_FLAT;

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_EXTEND = 65;
export const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 75;
export const PAGE_WIDTH_WIDE = 94;
