import { getArticles } from "./dataLoader.js";

let articles = [];
let currentFilter = "all";

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function getPreview(article) {
  return Array.isArray(article.content)
    ? article.content.join(" ")
    : article.content || "";
}

async function init() {
  articles = await getArticles();
  buildFilters();
  render(articles);
  renderActiveFilters();
}

init();

/* ================= FILTERS ================= */

function buildFilters() {
  const container = document.getElementById("filters");

  const categories = ["all", ...new Set(articles.map(a => a.category))];

  container.innerHTML = categories
    .map(
      cat => `
      <button class="filter-btn ${cat === "all" ? "active" : ""}" data-cat="${cat}">
        ${cat}
      </button>
    `
    )
    .join("");

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    currentFilter = btn.dataset.cat;

    document
      .querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    applyFilters();
  });
}

/* ================= FILTER LOGIC ================= */

function applyFilters() {
  const q = normalize(document.getElementById("search").value);

  const filtered = articles.filter((a) => {
    const text = getPreview(a);

    const matchesSearch =
      normalize(a.title).includes(q) ||
      normalize(text).includes(q) ||
      (a.tags || []).some((t) => normalize(t).includes(q));

    const matchesCategory =
      currentFilter === "all" ||
      normalize(a.category) === normalize(currentFilter);

    return matchesSearch && matchesCategory;
  });

  render(filtered);
  renderActiveFilters();
}

/* ================= ACTIVE FILTER UI ================= */

function renderActiveFilters() {
  const box = document.getElementById("activeFilters");
  const search = document.getElementById("search").value;

  const parts = [];

  if (currentFilter !== "all") {
    parts.push(`Category: ${currentFilter}`);
  }

  if (search.trim()) {
    parts.push(`Search: "${search}"`);
  }

  box.innerHTML = parts
    .map((p) => `<span class="active-filter">${p}</span>`)
    .join("");
}

/* ================= RENDER ================= */

function render(list) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<p>No articles found.</p>";
    return;
  }

  list.forEach((a) => {
    const div = document.createElement("div");
    div.className = "article";
    div.dataset.id = a.id;

    const previewText = getPreview(a);

    const tagsHTML = (a.tags || [])
      .map(
        (tag) =>
          `<span class="tag clickable-tag" data-tag="${tag}">${tag}</span>`
      )
      .join("");

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${previewText.slice(0, 180)}...</p>
      <div class="tags">${tagsHTML}</div>
    `;

    container.appendChild(div);
  });
}

/* ================= EVENTS ================= */

document.getElementById("search").addEventListener("input", applyFilters);

/* single delegated handler */
document.getElementById("articles").addEventListener("click", (e) => {
  const tag = e.target.closest(".clickable-tag");

  if (tag) {
    document.getElementById("search").value = tag.dataset.tag;
    applyFilters();
    return;
  }

  const card = e.target.closest(".article");
  if (card) {
    window.location.href = `article.html?id=${card.dataset.id}`;
  }
});
