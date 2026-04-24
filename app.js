let articles = [];

// Load data
fetch('data/articles.json')
  .then(res => res.json())
  .then(data => {
    articles = data;
    render(articles);
  });

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

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${a.content.slice(0, 180)}...</p>
      <div class="tags">${tagsHTML}</div>
    `;

div.onclick = () => {
  window.location.href = `article.html?id=${a.id}`;
};

    container.appendChild(div);
  });
}

// Search functionality
document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.content.toLowerCase().includes(q) ||
    (a.tags || []).join(" ").toLowerCase().includes(q)
  );

  render(filtered);
});
