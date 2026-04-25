import { getArticles } from "./dataLoader.js";

let articles = [];
let currentFilter = "all";

function normalize(str = "") {
  return str.toLowerCase().trim();
}

async function init() {
  articles = await getArticles();
  buildFilters();
  render(articles);
  renderActiveFilters();
}

init();

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

function applyFilters() {
  const q = normalize(document.getElementById("search").value);

  const filtered = articles.filter((a) => {
    const text = Array.isArray(a.content)
      ? a.content.join(" ")
      : a.content || "";

    const matchesSearch =
      normalize(a.title).includes(q) ||
      normalize(text).includes(q) ||
      (a.tags || []).some((t) => normalize(t).includes(q));

    const matchesCategory =
      currentFilter === "all" || a.category === currentFilter;

    return matchesSearch && matchesCategory;
  });

  render(filtered);
  renderActiveFilters();
}

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

    const previewText = Array.isArray(a.content)
      ? a.content.join(" ")
      : a.content || "";

    const tagsHTML = (a.tags || [])
      .map(
        (tag) => `<span class="tag clickable-tag" data-tag="${tag}">${tag}</span>`
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

document.getElementById("search").addEventListener("input", applyFilters);

// safer single listener for whole grid
document.getElementById("articles").addEventListener("click", (e) => {
  const tag = e.target.closest(".clickable-tag");
  if (tag) {
    const value = normalize(tag.dataset.tag);
    document.getElementById("search").value = value;
    applyFilters();
    return;
  }

  const card = e.target.closest(".article");
  if (card) {
    window.location.href = `article.html?id=${card.dataset.id}`;
  }
});
