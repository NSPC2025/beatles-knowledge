const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch("data/articles.json")
  .then(res => res.json())
  .then(data => {
    const article = data.find(a => a.id == id);

    if (!article) return;

    document.getElementById("title").textContent = article.title;
    document.getElementById("content").innerHTML = article.content;

    const tags = document.getElementById("tags");
    tags.innerHTML = (article.tags || [])
      .map(t => `<span class="tag">${t}</span>`)
      .join("");
  });
