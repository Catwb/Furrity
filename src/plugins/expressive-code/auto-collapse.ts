import { definePlugin } from "@expressive-code/core";
import { pluginCollapsibleSectionsTexts } from "@expressive-code/plugin-collapsible-sections";

// 中文本地化（PluginTexts 对 zh_CN 会先匹配 zh）
pluginCollapsibleSectionsTexts.addLocale("zh", {
	collapsedLines: "已折叠 {lineCount} 行",
});

export function pluginAutoCollapse(threshold: number) {
	return definePlugin({
		name: "Auto Collapse Long Code Blocks",
		hooks: {
			preprocessMetadata: ({ codeBlock }) => {
				// 作者已手动指定 collapse 时，尊重手动标记
				const manualCollapse = codeBlock.metaOptions.getRanges("collapse");
				if (manualCollapse.length > 0) return;

				const totalLines = codeBlock.getLines().length;
				if (threshold > 0 && totalLines > threshold) {
					codeBlock.props.collapse = `${threshold + 1}-${totalLines}`;
				}
				// 折叠区触底，collapsible-auto 会采用 collapsible-end（可再收起）
				codeBlock.props.collapseStyle = "collapsible-auto";
			},
		},
	});
}
