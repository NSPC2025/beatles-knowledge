import { getArticles } from "./dataLoader.js";

let articles = [];
let currentFilter = "all";
let searchQuery = "";

/* ===== normalize ===== */
function normalize(str = "") {
  return str.toLowerCase().trim();
}

/* ===== preprocess once ===== */
function prepareArticles(data) {
  return data.map(a => ({
    ...a,
    _searchText: normalize(
      (a.title || "") +
      " " +
      (Array.isArray(a.content) ? a.content.join(" ") : a.content || "") +
      " " +
      (a.tags || []).join(" ")
    )
  }));
}

/* ================= INIT ================= */

async function init() {
  const raw = await getArticles();
  articles = prepareArticles(raw);

  readURLParams();   // ✅ NEW
  buildFilters();
  attachEvents();
  applyFilters();
}

init();

/* ================= URL PARAMS ================= */

function readURLParams() {
  const params = new URLSearchParams(window.location.search);

  const tag = params.get("tag");
  if (tag) {
    searchQuery = tag;
  }
}

/* ================= EVENTS ================= */

function attachEvents() {
  const searchInput = document.getElementById("search");
  const articlesEl = document.getElementById("articles");
  const filtersEl = document.getElementById("filters");

  if (!searchInput || !articlesEl || !filtersEl) return;

  searchInput.value = searchQuery; // sync UI

  searchInput.addEventListener("input", debounce((e) => {
    searchQuery = e.target.value || "";
    applyFilters();
  }, 150));

  articlesEl.addEventListener("click", (e) => {
    const tag = e.target.closest(".clickable-tag");

    if (tag) {
      searchQuery = tag.dataset.tag || "";
      searchInput.value = searchQuery;
      applyFilters();
      return;
    }

    const card = e.target.closest(".article");
    if (card) {
      window.location.href = `article.html?id=${card.dataset.id}`;
    }
  });

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    currentFilter = btn.dataset.cat || "all";

    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    applyFilters();
  });
}

/* ================= FILTER BUTTONS ================= */

function buildFilters() {
  const container = document.getElementById("filters");
  if (!container) return;

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
    const matchesSearch =
      !q || article._searchText.includes(q);

    const matchesCategory =
      currentFilter === "all" ||
      article.category === currentFilter;

    return matchesSearch && matchesCategory;
  });

  render(filtered);
  renderActiveFilters();
}

/* ================= RENDER ================= */

function render(list) {
  const container = document.getElementById("articles");
  if (!container) return;

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<p>No articles found.</p>";
    return;
  }

  list.forEach(article => {
    const div = document.createElement("div");
    div.className = "article";
    div.dataset.id = article.id;

    const preview = Array.isArray(article.content)
      ? article.content.join(" ")
      : article.content || "";

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

/* ================= ACTIVE FILTERS ================= */

function renderActiveFilters() {
  const box = document.getElementById("activeFilters");
  if (!box) return;

  const parts = [];

  if (currentFilter !== "all") {
    parts.push({ label: `Category: ${currentFilter}`, type: "category" });
  }

  if (searchQuery.trim()) {
    parts.push({ label: `Search: "${searchQuery}"`, type: "search" });
  }

  box.innerHTML = parts.map(p => `
    <span class="active-filter" data-type="${p.type}">
      ${p.label} ✕
    </span>
  `).join("");

  box.querySelectorAll(".active-filter").forEach(el => {
    el.addEventListener("click", () => {
      const type = el.dataset.type;

      if (type === "category") {
        currentFilter = "all";

        document.querySelectorAll(".filter-btn")
          .forEach(b => b.classList.remove("active"));

        const allBtn = document.querySelector('[data-cat="all"]');
        if (allBtn) allBtn.classList.add("active");
      }

      if (type === "search") {
        searchQuery = "";
        const input = document.getElementById("search");
        if (input) input.value = "";
      }

      applyFilters();
    });
  });
}

/* ================= UTIL ================= */

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
