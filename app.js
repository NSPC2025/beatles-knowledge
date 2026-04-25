import { getArticles } from "./dataLoader.js";

let articles = [];
let currentFilter = "all";
let searchQuery = "";

/* ================= INIT ================= */

async function init() {
  articles = await getArticles();

  readURLParams();
  buildFilters();
  attachEvents();
  applyFilters();
}

init();

/* ================= URL PARAMS ================= */

function readURLParams() {
  const params = new URLSearchParams(window.location.search);

  const tag = params.get("tag");
  const search = params.get("search");
  const category = params.get("category");

  if (search) {
    searchQuery = search.toLowerCase();
  } else if (tag) {
    searchQuery = tag.toLowerCase();
  }

  // 🔧 FIX: normalize category consistently
  if (category) {
    currentFilter = normalize(category);
  }
}

/* ================= EVENTS ================= */

function attachEvents() {
  const searchInput = document.getElementById("search");
  const articlesEl = document.getElementById("articles");
  const filtersEl = document.getElementById("filters");

  if (!searchInput || !articlesEl || !filtersEl) return;

  searchInput.value = searchQuery;

  searchInput.addEventListener(
    "input",
    debounce((e) => {
      searchQuery = (e.target.value || "").toLowerCase().trim();
      updateURL();
      applyFilters();
    }, 150)
  );

  articlesEl.addEventListener("click", (e) => {
    const tag = e.target.closest(".clickable-tag");

    if (tag) {
      searchQuery = (tag.dataset.tag || "").toLowerCase();
      searchInput.value = searchQuery;
      updateURL();
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

    currentFilter = normalize(btn.dataset.cat || "all");

    document.querySelectorAll(".filter-btn").forEach((b) =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    updateURL();
    applyFilters();
  });
}

/* ================= URL UPDATE ================= */

function updateURL() {
  const params = new URLSearchParams();

  if (searchQuery) params.set("search", searchQuery);
  if (currentFilter !== "all") params.set("category", currentFilter);

  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", newURL);
}

/* ================= FILTER BUTTONS ================= */

function buildFilters() {
  const container = document.getElementById("filters");
  if (!container) return;

  // 🔧 FIX: strict normalization at source
  const categories = [
    "all",
    ...new Set(
      articles
        .flatMap((a) => a.category || [])
        .map(normalize)
    ),
  ];

  container.innerHTML = categories
    .map(
      (cat) => `
      <button class="filter-btn ${cat === currentFilter ? "active" : ""}" data-cat="${cat}">
        ${capitalize(cat)}
      </button>
    `
    )
    .join("");
}

/* ================= SEARCH ENGINE ================= */

function applyFilters() {
  const words = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filtered = articles
    .filter((article) => {
      const matchesCategory =
        currentFilter === "all" ||
        (article.category || []).map(normalize).includes(currentFilter);

      if (!matchesCategory) return false;

      if (!words.length) return true;

      const text = article._searchText || "";

      for (const w of words) {
        if (!text.includes(w)) return false;
      }

      return true;
    })
    .map((article) => {
      if (!words.length) return { article, score: 1 };

      let score = 0;
      const text = article._searchText || "";

      for (const w of words) {
        if (article._title?.includes(w)) score += 5;
        if (article._tags?.includes(w)) score += 3;
        if (article._categories?.includes(w)) score += 2;
        if (text.includes(w)) score += 1;
      }

      return { article, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.article);

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

  list.forEach((article) => {
    const div = document.createElement("div");
    div.className = "article";
    div.dataset.id = article.id;

    const preview = article._content || "";
    const mainCategory = article.category?.[0] || "uncategorized";

    const tagsHTML = (article.tags || [])
      .map(
        (tag) =>
          `<span class="tag clickable-tag" data-tag="${tag}">${tag}</span>`
      )
      .join("");

    div.innerHTML = `
      <h3>${article.title}</h3>
      <p>${preview.slice(0, 180)}...</p>
      <div class="tags">
        <span class="tag">${capitalize(mainCategory)}</span>
        ${tagsHTML}
      </div>
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
    parts.push({
      label: `Category: ${capitalize(currentFilter)}`,
      type: "category",
    });
  }

  if (searchQuery.trim()) {
    parts.push({ label: `Search: "${searchQuery}"`, type: "search" });
  }

  box.innerHTML = parts
    .map(
      (p) => `
      <span class="active-filter" data-type="${p.type}">
        ${p.label} ✕
      </span>
    `
    )
    .join("");

  box.querySelectorAll(".active-filter").forEach((el) => {
    el.addEventListener("click", () => {
      const type = el.dataset.type;

      if (type === "category") currentFilter = "all";

      if (type === "search") {
        searchQuery = "";
        const input = document.getElementById("search");
        if (input) input.value = "";
      }

      updateURL();
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

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
