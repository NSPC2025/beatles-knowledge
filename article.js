import { getArticles } from "./dataLoader.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

let allArticles = [];

async function init() {
  if (!id || isNaN(id)) {
    renderError("Invalid article ID");
    return;
  }

  allArticles = await getArticles();

  const article = allArticles.find((a) => a.id === id);

  if (!article) {
    renderError("Article not found");
    return;
  }

  renderArticle(article);
  renderRelated(article);
  attachRelatedClick();
  attachTagClick();
}

init();

/* ================= ERROR ================= */

function renderError(msg) {
  document.body.innerHTML = `
    <div style="padding:40px;font-family:sans-serif">
      <h2>${msg}</h2>
      <a href="index.html">← Back to home</a>
    </div>
  `;
}

/* ================= ARTICLE ================= */

function renderArticle(article) {
  const title = document.getElementById("title");
  const meta = document.getElementById("meta");
  const content = document.getElementById("content");
  const tags = document.getElementById("tags");

  if (!title || !meta || !content || !tags) return;

  title.textContent = article.title || "Untitled";

  const mainCategory = article.category?.[0] || "uncategorized";
  meta.innerHTML = `<span class="tag">${capitalize(mainCategory)}</span>`;

  content.innerHTML = "";

  // 🔥 TABLE OF CONTENTS (NEW)
  if (article.sections && article.sections.length > 1) {
    const toc = document.createElement("div");
    toc.className = "toc";

    toc.innerHTML = `
      <strong>Contents</strong>
      <ul>
        ${article.sections
          .map(
            (s, i) =>
              `<li><a href="#section-${i}">${s.title}</a></li>`
          )
          .join("")}
      </ul>
    `;

    content.appendChild(toc);
  }

  // 🔥 Sections
  if (article.sections) {
    article.sections.forEach((section, i) => {
      const h2 = document.createElement("h2");
      h2.textContent = section.title;
      h2.id = `section-${i}`; // 👈 anchor target
      content.appendChild(h2);

      (section.content || []).forEach((p) => {
        const el = document.createElement("p");
        el.textContent = p;
        content.appendChild(el);
      });
    });
  } else {
    const paragraphs = Array.isArray(article.content)
      ? article.content
      : [article.content || ""];

    paragraphs.forEach((p) => {
      const el = document.createElement("p");
      el.textContent = p;
      content.appendChild(el);
    });
  }

  tags.innerHTML = (article.tags || [])
    .map(
      (t) =>
        `<span class="tag clickable-tag" data-tag="${t}">${t}</span>`
    )
    .join("");
}

/* ================= RELATED ================= */

function renderRelated(article) {
  const relatedEl = document.getElementById("related");
  if (!relatedEl) return;

  relatedEl.innerHTML = "";

  const related = allArticles
    .map((a) => {
      if (a.id === article.id) return null;

      const aCats = a.category || [];
      const aTags = a.tags || [];
      const bCats = article.category || [];
      const bTags = article.tags || [];

      let score = 0;

      const normalizedBCats = new Set(bCats.map(normalize));
      const sharedCategories = aCats.filter((c) =>
        normalizedBCats.has(normalize(c))
      );
      score += sharedCategories.length * 3;

      const normalizedBTags = new Set((bTags || []).map(normalize));
      const sharedTags = aTags.filter((t) =>
        normalizedBTags.has(normalize(t))
      );
      score += sharedTags.length * 2;

      return score > 0 ? { a, score } : null;
    })
    .filter(Boolean)
    .sort((x, y) => y.score - x.score)
    .slice(0, 4)
    .map((x) => x.a);

  if (!related.length) {
    relatedEl.innerHTML = "<p>No related articles.</p>";
    return;
  }

  related.forEach((a) => {
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

function normalize(str = "") {
  return str.toLowerCase().trim();
}
