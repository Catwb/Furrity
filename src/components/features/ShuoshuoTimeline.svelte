<script lang="ts">
import { onMount } from "svelte";

interface Props {
	avatar: string;
	name: string;
	fetchUrl: string;
}

let { avatar, name, fetchUrl, ..._rest }: Props = $props();

interface ShuoshuoEntry {
	date: string;
	content: string | string[];
	images?: string[];
	pinned?: boolean;
}

let entries: ShuoshuoEntry[] = $state([]);
let loading = $state(true);
let error = $state("");

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseInline(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-[var(--primary)] hover:underline">$1</a>')
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/\*([^*]+)\*/g, "<em>$1</em>")
		.replace(/`([^`]+)`/g, "<code class='bg-black/5 dark:bg-white/10 px-1 rounded text-sm'>$1</code>");
}

function renderContent(entry: ShuoshuoEntry): string {
	const paragraphs = Array.isArray(entry.content) ? entry.content : [entry.content];
	return paragraphs.map((p) => `<p class="leading-relaxed mb-2 last:mb-0">${parseInline(p)}</p>`).join("\n");
}

let viewingImgs: string[] = [];
let viewingIdx = $state(-1);

function openViewer(index: number, images: string[]) {
	viewingImgs = images;
	viewingIdx = index;
}

function closeViewer() {
	viewingIdx = -1;
	viewingImgs = [];
}

function prevImg() {
	viewingIdx = (viewingIdx - 1 + viewingImgs.length) % viewingImgs.length;
}

function nextImg() {
	viewingIdx = (viewingIdx + 1) % viewingImgs.length;
}

function onKeydown(e: KeyboardEvent) {
	if (viewingIdx < 0) return;
	if (e.key === "Escape") closeViewer();
	if (e.key === "ArrowLeft") prevImg();
	if (e.key === "ArrowRight") nextImg();
}

onMount(async () => {
	document.addEventListener("keydown", onKeydown);
	try {
		const cacheBuster = `t=${Date.now()}`;
		const url = fetchUrl.includes("?") ? `${fetchUrl}&${cacheBuster}` : `${fetchUrl}?${cacheBuster}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data: ShuoshuoEntry[] = await res.json();
		entries = data.sort((a, b) => {
			if (a.pinned && !b.pinned) return -1;
			if (!a.pinned && b.pinned) return 1;
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
	} catch (e) {
		error = "加载说说失败";
		console.error(e);
	} finally {
		loading = false;
	}

	return () => document.removeEventListener("keydown", onKeydown);
});
</script>

{#if loading}
	<div class="flex justify-center py-16">
		<div class="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
	</div>
{:else if error}
	<div class="flex justify-center py-16 text-black/40 dark:text-white/40 text-sm">{error}</div>
{:else if entries.length === 0}
	<div class="flex justify-center py-16 text-black/40 dark:text-white/40 text-sm">还没有说说</div>
{:else}
	<div class="space-y-6">
		{#each entries as entry, i (entry.date + i)}
			<div class="flex gap-3">
				<div class="shrink-0 mt-1">
					<img src={avatar} alt={name} class="w-9 h-9 rounded-full object-cover bg-black/5 dark:bg-white/5" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-baseline gap-2 mb-1">
						<span class="text-sm font-semibold text-black/80 dark:text-white/80">{name}</span>
						<span class="text-xs text-black/40 dark:text-white/40">{formatDate(entry.date)}</span>
						{#if entry.pinned}
							<span class="text-xs text-[var(--primary)] font-medium">置顶</span>
						{/if}
					</div>
					<div class="card-base rounded-xl rounded-tl-md px-4 py-3 text-sm text-black/80 dark:text-white/80">
						{@html renderContent(entry)}
						{#if entry.images?.length}
							<div class="grid gap-1.5 mt-2" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))">
								{#each entry.images as img, j}
									<button onclick={() => openViewer(j, entry.images!)} class="block overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 cursor-pointer w-full text-left p-0 border-0">
										<img src={img} loading="lazy" class="w-full h-36 object-cover hover:scale-105 transition-transform duration-300" />
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if viewingIdx >= 0}
	<div class="absolute inset-0 z-50 flex items-center justify-center bg-black/85 rounded-[var(--radius-large)]">
		<button onclick={closeViewer} class="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer border-0 text-xl leading-none">&times;</button>
		{#if viewingImgs.length > 1}
			<button onclick={prevImg} class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer border-0 text-2xl leading-none">&lsaquo;</button>
			<button onclick={nextImg} class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer border-0 text-2xl leading-none">&rsaquo;</button>
			<div class="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm font-medium bg-black/40 px-3 py-1 rounded-full">{viewingIdx + 1} / {viewingImgs.length}</div>
		{/if}
		<img src={viewingImgs[viewingIdx]} onclick={(e) => e.stopPropagation()} class="max-w-full max-h-[80vh] object-contain select-none px-4" />
	</div>
{/if}
