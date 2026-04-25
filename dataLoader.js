let cachedArticles = null;

export async function getArticles() {
  try {
    if (cachedArticles) return cachedArticles;

    const res = await fetch("./data/articles.json");

    if (!res.ok) {
      throw new Error("Failed to load articles.json");
    }

    cachedArticles = await res.json();
    return cachedArticles;

  } catch (err) {
    console.error("Error loading articles:", err);
    return [];
  }
}
