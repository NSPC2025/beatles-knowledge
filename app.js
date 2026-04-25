let articles = [];
let currentFilter = "all";

// Load data
fetch('data/articles.json')
  .then(res => res.json())
  .then(data => {
    articles = data;
    buildFilters();
    render(articles);
  });

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
}

// Render articles
function render(list) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  list.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";

    // Build tags
    const tagsHTML = (a.tags || [])
      .map(tag => `<span class="tag">${tag}</span>`)
      .join("");

    // Fix content preview (array or string)
    const previewText = Array.isArray(a.content)
      ? a.content.join(" ")
      : a.content;

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${previewText.slice(0, 180)}...</p>
      <div class="tags">${tagsHTML}</div>
    `;

    div.onclick = () => {
      window.location.href = \`article.html?id=\${a.id}\`;
    };

    container.appendChild(div);
  });
}

// Search listener
document.getElementById("search").addEventListener("input", applyFilters);
