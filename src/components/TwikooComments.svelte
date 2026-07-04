<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { siteConfig } from "../config";

const twikooConfig = siteConfig.twikoo;
const TWIKOO_CDN = twikooConfig?.cdn || "https://registry.npmmirror.com/twikoo/1.7.12/files/dist/twikoo.all.min.js";

let loaded = $state(false);
let cssLoaded = $state(false);
let twikooReady = $state(false);
let observer: MutationObserver | null = null;

function getDarkMode(): boolean {
	return document.documentElement.classList.contains("dark");
}

function observeDarkMode(callback: (dark: boolean) => void): MutationObserver {
	const observer = new MutationObserver(() => {
		callback(getDarkMode());
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
	return observer;
}

function loadTwikooScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if ((window as any).twikoo) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.src = TWIKOO_CDN;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Twikoo"));
		document.head.appendChild(script);
	});
}

function destroyTwikoo() {
	const twikoo = (window as any).twikoo;
	if (twikoo && twikoo.destroy) {
		try {
			twikoo.destroy();
		} catch (e) {
			// ignore
		}
	}
	const el = document.getElementById("tcomment");
	if (el) el.innerHTML = "";
}

async function initTwikoo(path?: string) {
	if (!twikooConfig?.envId) return;
	const twikoo = (window as any).twikoo;
	if (!twikoo) return;

	const el = document.getElementById("tcomment");
	if (!el) return;

	el.innerHTML = "";

	await twikoo.init({
		envId: twikooConfig.envId,
		el: "#tcomment",
		path: path || window.location.pathname,
		region: twikooConfig.region || "",
		lang: twikooConfig.lang || "",
		dark: getDarkMode(),
	});
}

function loadCustomCSS(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (cssLoaded) {
			resolve();
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		link.onload = () => {
			cssLoaded = true;
			resolve();
		};
		link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
		document.head.appendChild(link);
	});
}

async function setup() {
	if (!twikooConfig?.enable || !twikooConfig?.envId) return;

	try {
		if (twikooConfig.css) {
			await loadCustomCSS(twikooConfig.css);
		}
		await loadTwikooScript();
		twikooReady = true;
		await initTwikoo();
		loaded = true;
	} catch (e) {
		console.error("Twikoo init failed:", e);
	}
}

onMount(async () => {
	await setup();

	// Listen for Swup navigation events
	const onTransitionStart = () => {
		destroyTwikoo();
		loaded = false;
	};

	const onTransitionEnd = async () => {
		if (twikooReady) {
			await initTwikoo();
			loaded = true;
		}
	};

	window.addEventListener("swup:transitionStart", onTransitionStart);
	window.addEventListener("swup:transitionEnd", onTransitionEnd);

	return () => {
		window.removeEventListener("swup:transitionStart", onTransitionStart);
		window.removeEventListener("swup:transitionEnd", onTransitionEnd);
	};
});

onDestroy(() => {
	destroyTwikoo();
	observer?.disconnect();
});
</script>

<div id="tcomment" class="twikoo-comments"></div>
