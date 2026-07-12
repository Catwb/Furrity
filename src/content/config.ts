import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		pinned: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		plugins: z.array(z.string()).optional().default([]),
		tags: z.array(z.string()).optional().default([]),
		category: z
			.union([z.string(), z.array(z.string())])
			.optional()
			.nullable()
			.default("")
			.transform((val) => {
				if (!val) return [];
				if (Array.isArray(val)) return val;
				return [val];
			}),
		lang: z.string().optional().default(""),
		abbrlink: z.string().optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const specCollection = defineCollection({
	schema: z.object({
		title: z.string(),
	}),
});

const novelsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(""),
		published: z.date().optional(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),

		novel: z.string(),
		novelTitle: z.string(),
		series: z.string().optional(),
		seriesOrder: z.number().optional(),
		volume: z.number().optional(),
		volumeTitle: z.string().optional(),

		chapter: z.number().optional(),
		part: z.number().optional(),
		characters: z.array(z.string()).optional().default([]),
		wordCount: z.number().optional(),
	}),
});

const charactersCollection = defineCollection({
	schema: z.object({
		name: z.string(),
		novel: z.string(),
		description: z.string().optional().default(""),
		avatar: z.string().optional(),
		role: z.enum(["protagonist", "antagonist", "supporting", "minor", "guest"]).optional(),
		alias: z.array(z.string()).optional().default([]),
	}),
});

const fursonaCollection = defineCollection({
	schema: z.object({
		name: z.string(),
		species: z.string(),
		color: z.string().optional(),
		avatar: z.string().optional(),
		banner: z.string().optional(),
		images: z
			.array(
				z.object({
					src: z.string(),
					alt: z.string().optional(),
				}),
			)
			.optional()
			.default([]),
		alias: z.array(z.string()).optional().default([]),
		intro: z.string().optional().default(""),
	}),
});

export const collections = {
	posts: postsCollection,
	spec: specCollection,
	novels: novelsCollection,
	characters: charactersCollection,
	fursonas: fursonaCollection,
};
