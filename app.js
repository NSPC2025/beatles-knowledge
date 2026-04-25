import { getArticles } from "./dataLoader.js";

let articles = [];
let currentFilter = "all";
let searchQuery = "";

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function getPreview(article) {
  return Array.isArray(article.content)
    ? article.content.join(" ")
    : article.content || "";
}

/* ================= INIT ================= */

async function init() {
  articles = await getArticles();

  buildFilters();
  attachEvents();

  applyFilters();
}

init();

/* ================= EVENTS ================= */

function attachEvents() {
  const searchInput = document.getElementById("search");

  searchInput.addEventListener("input", debounce((e) => {
    searchQuery = e.target.value;
    applyFilters();
  }, 200));

  document.getElementById("articles").addEventListener("click", (e) => {
    const tag = e.target.closest(".clickable-tag");

    if (tag) {
      searchQuery = tag.dataset.tag;
      document.getElementById("search").value = searchQuery;
      applyFilters();
      return;
    }

    const card = e.target.closest(".article");
    if (card) {
      window.location.href = `article.html?id=${card.dataset.id}`;
    }
  });

  document.getElementById("filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    currentFilter = btn.dataset.cat;

    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    applyFilters();
  });
}

/* ================= FILTERS ================= */

function buildFilters() {
  const container = document.getElementById("filters");

  const categories = ["all", ...new Set(articles.map(a => a.category))];

  container.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === "all" ? "active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");
}

/* ================= FILTER ENGINE ================= */

function applyFilters() {
  const q = normalize(searchQuery);

  const filtered = articles.filter(article => {
    const text = getPreview(article);

    const matchesSearch =
      normalize(article.title).includes(q) ||
      normalize(text).includes(q) ||
      (article.tags || []).some(t => normalize(t).includes(q));

    const matchesCategory =
      currentFilter === "all" ||
      article.category === currentFilter;

    return matchesSearch && matchesCategory;
  });

  render(filtered);
  renderActiveFilters();
}

/* ================= UI ================= */

function render(list) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<p>No articles found.</p>";
    return;
  }

  list.forEach(article => {
    const div = document.createElement("div");
    div.className = "article";
    div.dataset.id = article.id;

    const preview = getPreview(article);

    const tagsHTML = (article.tags || [])
      .map(tag => `<span class="tag clickable-tag" data-tag="${tag}">${tag}</span>`)
      .join("");

    div.innerHTML = `
      <h3>${article.title}</h3>
      <p>${preview.slice(0, 180)}...</p>
      <div class="tags">${tagsHTML}</div>
    `;

    container.appendChild(div);
  });
}

function renderActiveFilters() {
  const box = document.getElementById("activeFilters");

  const parts = [];

  if (currentFilter !== "all") {
    parts.push(`Category: ${currentFilter}`);
  }

  if (searchQuery.trim()) {
    parts.push(`Search: "${searchQuery}"`);
  }

  box.innerHTML = parts
    .map(p => `<span class="active-filter">${p}</span>`)
    .join("");
}

/* ================= UTIL ================= */

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
