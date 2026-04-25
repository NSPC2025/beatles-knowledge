import { getArticles } from "./dataLoader.js";

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

async function init() {
  const data = await getArticles();
  const article = data.find(a => a.id === id);

  if (!article) {
    document.body.innerHTML = "<p>Article not found</p>";
    return;
  }

  document.getElementById("title").textContent = article.title;

  document.getElementById("meta").innerHTML = `
    <span class="tag">${article.category}</span>
  `;

  document.getElementById("content").innerHTML = article.content
    .map(p => `<p>${p}</p>`)
    .join("");

  document.getElementById("tags").innerHTML = (article.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join("");

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
}

init();
