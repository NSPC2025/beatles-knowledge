import { getArticles } from "./dataLoader.js";

let articles = [];
let currentFilter = "all";

// Load data
async function init() {
  articles = await getArticles();
  buildFilters();
  render(articles);
  renderActiveFilters();
}

init();

// Build category filters
function buildFilters() {
  const container = document.getElementById("filters");

  const categories = ["all", ...new Set(articles.map(a => a.category))];

  container.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === "all" ? "active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
      currentFilter = btn.dataset.cat;

      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      applyFilters();
    };
  });
}

// Apply search + category filters
function applyFilters() {
  const q = document.getElementById("search").value.toLowerCase();

  const filtered = articles.filter(a => {
    const text = Array.isArray(a.content)
      ? a.content.join(" ")
      : a.content;

    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      text.toLowerCase().includes(q) ||
      (a.tags || []).join(" ").toLowerCase().includes(q);

    const matchesCategory =
      currentFilter === "all" || a.category === currentFilter;

    return matchesSearch && matchesCategory;
  });

  render(filtered);
  renderActiveFilters();
}

// Active filters UI
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

  box.innerHTML = parts.map(p => `<span class="active-filter">${p}</span>`).join("");
}

// Render articles
function render(list) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>No articles found.</p>";
    return;
  }

  list.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";

    const tagsHTML = (a.tags || [])
      .map(tag => `<span class="tag clickable-tag" data-tag="${tag}">${tag}</span>`)
      .join("");

    const previewText = Array.isArray(a.content)
      ? a.content.join(" ")
      : a.content;

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${previewText.slice(0, 180)}...</p>
      <div class="tags">${tagsHTML}</div>
    `;

    div.onclick = () => {
      window.location.href = `article.html?id=${a.id}`;
    };

    container.appendChild(div);

    div.querySelectorAll(".clickable-tag").forEach(tagEl => {
      tagEl.onclick = (e) => {
        e.stopPropagation();

        const tag = tagEl.dataset.tag.toLowerCase();
        document.getElementById("search").value = tag;
        applyFilters();
      };
    });
  });
}

document.getElementById("search").addEventListener("input", applyFilters);
