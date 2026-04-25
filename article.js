import { getArticles } from "./dataLoader.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

let allArticles = [];

async function init() {
  allArticles = await getArticles();

  const article = allArticles.find(a => a.id === id);

  if (!article) {
    document.body.innerHTML = `
      <div style="padding:40px;font-family:sans-serif">
        <h2>Article not found</h2>
        <a href="index.html">← Back to home</a>
      </div>
    `;
    return;
  }

  renderArticle(article);
  renderRelated(article);
  attachRelatedClick();
}

init();

function renderArticle(article) {
  document.getElementById("title").textContent = article.title;

  document.getElementById("meta").innerHTML = `
    <span class="tag">${article.category || "uncategorized"}</span>
  `;

  const content = document.getElementById("content");
  content.innerHTML = "";

  const paragraphs = Array.isArray(article.content)
    ? article.content
    : [article.content || ""];

  paragraphs.forEach(p => {
    const el = document.createElement("p");
    el.textContent = p;
    content.appendChild(el);
  });

  document.getElementById("tags").innerHTML = (article.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join("");
}

function renderRelated(article) {
  const relatedEl = document.getElementById("related");
  relatedEl.innerHTML = "";

  const related = allArticles
    .filter(a =>
      a.id !== article.id &&
      (
        a.category === article.category ||
        (a.tags || []).some(t => (article.tags || []).includes(t))
      )
    )
    .slice(0, 4);

  if (!related.length) {
    relatedEl.innerHTML = "<p>No related articles.</p>";
    return;
  }

  related.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";
    div.dataset.id = a.id;

    const preview = Array.isArray(a.content)
      ? a.content.join(" ")
      : a.content || "";

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${preview.slice(0, 120)}...</p>
    `;

    relatedEl.appendChild(div);
  });
}

function attachRelatedClick() {
  document.getElementById("related").addEventListener("click", (e) => {
    const card = e.target.closest(".article");
    if (!card) return;

    window.location.href = `article.html?id=${card.dataset.id}`;
  });
}
