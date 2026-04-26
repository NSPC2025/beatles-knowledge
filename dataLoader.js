let cachedArticles = null;

/* ===== normalize ===== */
function normalize(str = "") {
  return str.toLowerCase().trim();
}

/* ===== extract content (NEW) ===== */
function extractContent(a) {
  if (a.sections) {
    return a.sections.flatMap(s => s.content || []).join(" ");
  }

  return Array.isArray(a.content)
    ? a.content.join(" ")
    : a.content || "";
}

/* ===== preprocess ===== */
function prepareArticles(data) {
  return data.map(a => {
    const contentText = extractContent(a);

    const tags = (a.tags || []).map(t => normalize(t));

    const categories = (Array.isArray(a.category)
      ? a.category
      : [a.category || "uncategorized"]
    ).map(c => normalize(c || "uncategorized"));

    return {
      ...a,

      category: categories,
      tags,

      _title: normalize(a.title || ""),
      _content: normalize(contentText),
      _tags: tags.join(" "),
      _categories: categories.join(" "),
      _searchText: normalize(
        (a.title || "") + " " +
        contentText + " " +
        tags.join(" ") + " " +
        categories.join(" ")
      )
    };
  });
}

export async function getArticles() {
  try {
    if (cachedArticles) return cachedArticles;

    const res = await fetch("./data/articles.json");

    if (!res.ok) {
      throw new Error("Failed to load articles.json");
    }

    const raw = await res.json();
    cachedArticles = prepareArticles(raw);

    return cachedArticles;

  } catch (err) {
    console.error("Error loading articles:", err);
    return [];
  }
}
