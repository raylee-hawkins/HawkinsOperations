export function normalizeToken(value) {
  return String(value || "").trim().toLowerCase();
}

export function applyFilter(list, activeTag, query) {
  const needle = normalizeToken(query);
  return list.filter((item) => {
    const tags = Array.isArray(item.tags) ? item.tags.map(normalizeToken) : [];
    const haystack = [
      item.title,
      item.summary,
      item.platform,
      item.type,
      ...(item.tags || [])
    ]
      .map((v) => normalizeToken(v))
      .join(" ");
    const matchesTag = activeTag === "all" || tags.includes(activeTag);
    const matchesQuery = !needle || haystack.includes(needle);
    return matchesTag && matchesQuery;
  });
}
