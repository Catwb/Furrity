/**
 * 灵动岛状态总线
 * ---------------------------------------------------------------------------
 * 只做三件事：收 moment、按优先级排序、通知订阅者。不碰 DOM、不碰 swup。
 *
 * 为什么自己写而不引第三方 island 库：
 *   1. 那些库基本都假设自己独占一块 fixed 区域，不理解 swup 的跨页存活模型
 *      （本项目的 containers 只有 main / #right-sidebar-container，见
 *      astro.config.mjs:129），换页时会把组件连根拔起重建；
 *   2. 它们把颜色写死在 CSS 变量里，而本主题的 --hue 是用户随时拖滑块改的
 *      （DisplaySettings.svelte:29），写死颜色会立刻破相。
 *
 * 单例挂在 window.__islandBus 上，理由和 window.__fireflyMusic /
 * window.__pageLoaderInit 一样：脚本可能被重复执行（HMR、二次挂载），
 * 模块作用域不保证唯一。
 */

export type IslandSource = "player" | "loader" | "search" | "nav" | "notice";

export type IslandSize = "dormant" | "mini" | "compact" | "expanded";

export interface IslandMoment {
	/** 去重键：同 id 原地更新，不排队 */
	id: string;
	source: IslandSource;
	/** 越大越靠前 */
	priority: number;
	/** 毫秒；省略 = 常驻，直到被 drop */
	ttl?: number;
	/** 这一条希望的展开程度，总线取最大值 */
	size?: IslandSize;
	/** 语义色调 */
	tone?: "primary" | "accent" | "neutral";
	/**
	 * 这条任务是否处于"活跃"状态。省略视为 true。
	 *
	 * 岛只在 lead 活跃时显示 —— 比如音乐暂停了，player 这条就是 active:false，
	 * 岛自动收起，而不是傻等用户去点它。注意这跟"用户有没有在操作"无关：
	 * 用户一直不动，只要音乐还在放，岛就一直显示。
	 */
	active?: boolean;
	/**
	 * 这条任务能不能把**已经收起**的岛叫醒。省略视为 true。
	 *
	 * 典型用法：换页提示（nav）设成 false ——
	 * 岛本来就藏着的时候，翻页不该把它弹出来（用户会觉得很吵）；
	 * 但岛本来就显示着（比如音乐在放），翻页时就可以顺手显示"载入中"。
	 */
	wake?: boolean;
	/** 写入内容。el 是 #dynamic-island 根节点 */
	render(el: HTMLElement): void;
	onLeave?(): void;
}

export interface IslandSnapshot {
	active: IslandMoment[];
	/** 所有 active 里最强的 size 诉求 */
	size: IslandSize;
	/** 排序里第一个 moment，主展示内容 */
	lead: IslandMoment | null;
}

export interface IslandBus {
	push(moment: IslandMoment): void;
	drop(id: string): void;
	get(id: string): IslandMoment | undefined;
	subscribe(fn: (snap: IslandSnapshot) => void): () => void;
	/** 内容有更新但队列没变时，也要通知一次（播放进度这类高频更新走这里） */
	touch(): void;
	/**
	 * 组件告诉总线"我此刻是不是被 hover / 点击拉开了"。
	 * provider 靠这个决定要不要订阅 fm:time 这种 4Hz 的高频事件 ——
	 * 折叠态读进度没人看得见，纯浪费。
	 */
	setExpanded(v: boolean): void;
	readonly expanded: boolean;
	readonly snapshot: IslandSnapshot;
}

const SIZE_RANK: Record<IslandSize, number> = {
	dormant: 0,
	mini: 1,
	compact: 2,
	expanded: 3,
};

export function createBus(maxStack = 3): IslandBus {
	const live = new Map<string, IslandMoment>();
	const timers = new Map<string, number>();
	const subs = new Set<(snap: IslandSnapshot) => void>();

	let snapshot: IslandSnapshot = { active: [], size: "dormant", lead: null };
	let expanded = false;

	function compute(): IslandSnapshot {
		const active = [...live.values()]
			.sort((a, b) => b.priority - a.priority)
			.slice(0, maxStack);

		let size: IslandSize = "dormant";
		for (const m of active) {
			const s = m.size ?? "compact";
			if (SIZE_RANK[s] > SIZE_RANK[size]) size = s;
		}

		return { active, size, lead: active[0] ?? null };
	}

	function flush(): void {
		snapshot = compute();
		for (const fn of subs) fn(snapshot);
	}

	return {
		push(moment) {
			live.set(moment.id, moment);
			const prev = timers.get(moment.id);
			if (prev !== undefined) {
				clearTimeout(prev);
				timers.delete(moment.id);
			}
			if (moment.ttl) {
				timers.set(
					moment.id,
					window.setTimeout(() => {
						timers.delete(moment.id);
						live.delete(moment.id);
						moment.onLeave?.();
						flush();
					}, moment.ttl),
				);
			}
			flush();
		},
		drop(id) {
			const m = live.get(id);
			const t = timers.get(id);
			if (!m && t === undefined) return;
			if (t !== undefined) {
				clearTimeout(t);
				timers.delete(id);
			}
			live.delete(id);
			m?.onLeave?.();
			flush();
		},
		get(id) {
			return live.get(id);
		},
		subscribe(fn) {
			subs.add(fn);
			fn(snapshot);
			return () => {
				subs.delete(fn);
			};
		},
		touch: flush,
		setExpanded(v) {
			expanded = v;
		},
		get expanded() {
			return expanded;
		},
		get snapshot() {
			return snapshot;
		},
	};
}

/** 全局单例。重复执行脚本时复用同一个实例。 */
export function getBus(maxStack = 3): IslandBus {
	if (!window.__islandBus) {
		window.__islandBus = createBus(maxStack);
	}
	return window.__islandBus;
}
