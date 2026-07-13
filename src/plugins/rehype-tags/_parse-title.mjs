const KNOWN_COLORS = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];

export function parseTitleProps(properties) {
  const result = { ...properties };
  const title = (properties.title || "").trim();
  if (!title) return result;

  // Already explicitly set — skip parsing
  if (properties.color && properties.title) return result;

  let parsedTitle = title;

  // Pattern 1: "text color:name" (postfix)
  if (!properties.color) {
    const suffix = title.match(/^(.*)\s+color:(\w+)$/);
    if (suffix && KNOWN_COLORS.includes(suffix[2].toLowerCase())) {
      result.color = suffix[2];
      parsedTitle = suffix[1].trim();
    }
  }

  // Pattern 2: "color::text" (prefix with :: separator)
  if (!result.color) {
    const prefix = parsedTitle.match(/^(\w+)::(.+)$/);
    if (prefix && KNOWN_COLORS.includes(prefix[1].toLowerCase())) {
      result.color = prefix[1];
      parsedTitle = prefix[2].trim();
    }
  }

  // Pattern 3: "color flag::text" (prefix with space-separated flag)
  if (!result.color) {
    const multi = parsedTitle.match(/^(\w+)\s+(\w+)::(.+)$/);
    if (multi && KNOWN_COLORS.includes(multi[1].toLowerCase())) {
      result.color = multi[1];
      if (multi[2] === "open") result.open = "true";
      parsedTitle = multi[3].trim();
    }
  }

  result.title = parsedTitle;
  return result;
}
