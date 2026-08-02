export function computeWordCount(body: string | undefined): number {
	if (!body) return 0;
	const text = body
		.replace(/!\[.*?\]\(.*?\)/g, "")
		.replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
		.replace(/<[^>]*>/g, "")
		.replace(/[*_~]{1,3}/g, "")
		.replace(/`{1,3}[^`]*`{1,3}/g, "")
		.replace(/^>\s*/gm, "")
		.replace(/^[\s]*[-*+]\s+/gm, "")
		.replace(/^[\s]*\d+\.\s+/gm, "")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^[-*_]{3,}\s*$/gm, "")
		.replace(/```[\s\S]*?```/g, "")
		.replace(/\s+/g, "");
	return text.length;
}
