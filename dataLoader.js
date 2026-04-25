let cachedArticles = null;

export async function getArticles() {
  if (cachedArticles) return cachedArticles;

  const res = await fetch("data/articles.json");
  cachedArticles = await res.json();
  return cachedArticles;
}
