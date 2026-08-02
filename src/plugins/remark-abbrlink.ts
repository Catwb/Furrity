import { siteConfig } from "../config/site";
import {
	type AbbrlinkAlg,
	type AbbrlinkRep,
	computeAbbrlink,
} from "../utils/abbrlink-utils";

/**
 * Remark plugin that automatically adds abbrlink to posts that don't have one.
 */
export function remarkAbbrlink() {
	return (tree: any, file: any) => {
		const frontmatter = file.data?.astro?.frontmatter || file.data;
		if (!frontmatter || frontmatter.published === undefined) return;

		if (!frontmatter.abbrlink) {
			const abbrConfig = siteConfig.abbrlink || {};
			const alg = abbrConfig.alg || "crc16";
			const rep = abbrConfig.rep || "dec";
			frontmatter.abbrlink = computeAbbrlink(
				frontmatter.title || "",
				new Date(frontmatter.published),
				alg as AbbrlinkAlg,
				rep as AbbrlinkRep,
			);
		}
	};
}
