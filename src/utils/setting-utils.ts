import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	DEFAULT_UI_STYLE,
	LIGHT_MODE,
	UI_STYLE_FLAT,
	UI_STYLE_NEU,
	type UI_STYLE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config/site";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	if (typeof document === "undefined") return Number.parseInt(fallback, 10);
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getHue(): number {
	if (typeof localStorage === "undefined") return getDefaultHue();
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function getUiStyle(): UI_STYLE {
	if (typeof localStorage === "undefined") return DEFAULT_UI_STYLE;
	return localStorage.getItem("uiStyle") === UI_STYLE_NEU
		? UI_STYLE_NEU
		: UI_STYLE_FLAT;
}

/**
 * Applies the interface style to <html>. "flat" removes the attribute entirely
 * so the default look carries no extra selector matching at all.
 */
export function applyUiStyleToDocument(style: UI_STYLE): void {
	const root = document.documentElement;
	if (style === UI_STYLE_NEU) {
		root.setAttribute("data-ui-style", UI_STYLE_NEU);
	} else {
		root.removeAttribute("data-ui-style");
	}
}

export function setUiStyle(style: UI_STYLE): void {
	localStorage.setItem("uiStyle", style);
	applyUiStyleToDocument(style);
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	if (typeof localStorage === "undefined") return DEFAULT_THEME;
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}
