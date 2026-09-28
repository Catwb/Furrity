<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	UI_STYLE_FLAT,
	UI_STYLE_NEU,
	type UI_STYLE,
} from "@constants/constants";
import { getDefaultHue, getHue, getUiStyle, setHue, setUiStyle } from "@utils/setting-utils";

let _props = $props();

let hue = $state(getHue());
const defaultHue = getDefaultHue();

let uiStyle = $state<UI_STYLE>(getUiStyle());

// Add a third entry here to introduce another style (see src/styles/neumorphic.css)
const uiStyles: { id: UI_STYLE; label: I18nKey; icon: string }[] = [
	{ id: UI_STYLE_FLAT, label: I18nKey.uiStyleFlat, icon: "fa6-solid:square" },
	{ id: UI_STYLE_NEU, label: I18nKey.uiStyleNeu, icon: "fa6-solid:cube" },
];

function resetHue() {
	hue = getDefaultHue();
}

$effect(() => {
	if (hue || hue === 0) {
		setHue(hue);
	}
});

$effect(() => {
	setUiStyle(uiStyle);
});
</script>

<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4">
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90 will-change-transform"
                    class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} onclick={resetHue}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="hueValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {hue}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none">
        <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
               class="slider" id="colorSlider" step="5" style="width: 100%">
    </div>

    <div class="flex flex-row gap-2 mt-5 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.uiStyle)}
        </div>
    </div>
    <div class="grid grid-cols-2 gap-2">
        {#each uiStyles as item (item.id)}
            <button type="button"
                    aria-label={i18n(item.label)}
                    aria-pressed={uiStyle === item.id}
                    class="btn-plain scale-animation rounded-lg h-9 gap-1.5 text-sm font-bold"
                    class:current-theme-btn={uiStyle === item.id}
                    onclick={() => (uiStyle = item.id)}
            >
                <Icon icon={item.icon} class="text-[1rem]"></Icon>
                {i18n(item.label)}
            </button>
        {/each}
    </div>
</div>


<style lang="stylus">
    #display-setting
      input[type="range"]
        -webkit-appearance none
        height 1.5rem
        background-image var(--color-selection-bar)
        transition background-image 0.15s ease-in-out

        /* Input Thumb */
        &::-webkit-slider-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-moz-range-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          border-width 0
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-ms-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

</style>
