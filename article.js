const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

fetch("data/articles.json")
  .then(res => res.json())
  .then(data => {
    const article = data.find(a => a.id === id);

    if (!article) {
      document.body.innerHTML = "<p>Article not found</p>";
      return;
    }

    // Title
    document.getElementById("title").textContent = article.title;

    // Meta (category)
    document.getElementById("meta").innerHTML = `
      <span class="tag">${article.category}</span>
    `;

    // Content
    const contentEl = document.getElementById("content");
    contentEl.innerHTML = article.content
      .map(p => `<p>${p}</p>`)
      .join("");

    // Tags
    const tagsEl = document.getElementById("tags");
    tagsEl.innerHTML = (article.tags || [])
      .map(t => `<span class="tag">${t}</span>`)
      .join("");

    // 🔥 Related articles (same category, excluding current)
    const related = data
      .filter(a => a.category === article.category && a.id !== article.id)
      .slice(0, 3);

    const relatedEl = document.getElementById("related");

    related.forEach(a => {
      const div = document.createElement("div");
      div.className = "article";

      const preview = Array.isArray(a.content)
        ? a.content.join(" ")
        : a.content;

      div.innerHTML = `
        <h3>${a.title}</h3>
        <p>${preview.slice(0, 120)}...</p>
      `;

      div.onclick = () => {
        window.location.href = `article.html?id=${a.id}`;
      };

      relatedEl.appendChild(div);
    });
  });
