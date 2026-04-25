import { getArticles } from "./dataLoader.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

let allArticles = [];

async function init() {
  allArticles = await getArticles();

  const article = allArticles.find(a => a.id === id);

  if (!article) {
    document.body.innerHTML = `
      <div style="padding:40px;font-family:sans-serif">
        <h2>Article not found</h2>
        <a href="index.html">← Back to home</a>
      </div>
    `;
    return;
  }

  renderArticle(article);
  renderRelated(article);
  attachRelatedClick();
  attachTagClick();
}

init();

/* ================= ARTICLE ================= */

function renderArticle(article) {
  const title = document.getElementById("title");
  const meta = document.getElementById("meta");
  const content = document.getElementById("content");
  const tags = document.getElementById("tags");

  if (!title || !meta || !content || !tags) return;

  title.textContent = article.title || "Untitled";

  const mainCategory = article.category[0] || "uncategorized";

  meta.innerHTML = `
    <span class="tag">${capitalize(mainCategory)}</span>
  `;

  content.innerHTML = "";

  const paragraphs = Array.isArray(article.content)
    ? article.content
    : [article.content || ""];

  paragraphs.forEach(p => {
    const el = document.createElement("p");
    el.textContent = p;
    content.appendChild(el);
  });

  tags.innerHTML = (article.tags || [])
    .map(t => `<span class="tag clickable-tag" data-tag="${t}">${t}</span>`)
    .join("");
}

/* ================= RELATED ================= */

function renderRelated(article) {
  const relatedEl = document.getElementById("related");
  if (!relatedEl) return;

  relatedEl.innerHTML = "";

  const related = allArticles
    .map(a => {
      if (a.id === article.id) return null;

      let score = 0;

      // category overlap
      const sharedCategories = a.category.filter(c =>
        article.category.includes(c)
      );
      score += sharedCategories.length * 3;

      // tag overlap
      const sharedTags = (a.tags || []).filter(t =>
        (article.tags || []).includes(t)
      );
      score += sharedTags.length * 2;

      return score > 0 ? { a, score } : null;
    })
    .filter(Boolean)
    .sort((x, y) => y.score - x.score)
    .slice(0, 4)
    .map(x => x.a);

  if (!related.length) {
    relatedEl.innerHTML = "<p>No related articles.</p>";
    return;
  }

  related.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";
    div.dataset.id = a.id;

    const preview = a._content || "";

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${preview.slice(0, 120)}...</p>
    `;

    relatedEl.appendChild(div);
  });
}

/* ================= EVENTS ================= */

function attachRelatedClick() {
  const relatedEl = document.getElementById("related");
  if (!relatedEl) return;

  relatedEl.addEventListener("click", (e) => {
    const card = e.target.closest(".article");
    if (!card) return;

    window.location.href = `article.html?id=${card.dataset.id}`;
  });
}

function attachTagClick() {
  const tags = document.getElementById("tags");
  if (!tags) return;

  tags.addEventListener("click", (e) => {
    const tag = e.target.closest(".clickable-tag");
    if (!tag) return;

    const value = tag.dataset.tag;
    window.location.href = `index.html?tag=${encodeURIComponent(value)}`;
  });
}

/* ================= UTIL ================= */

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
