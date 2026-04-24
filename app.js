let articles = [];

fetch('data/articles.json')
  .then(res => res.json())
  .then(data => {
    articles = data;
    render(articles);
  });

function render(list) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  list.forEach(a => {
    const div = document.createElement("div");
    div.className = "article";

    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${a.content}</p>
      <small>${(a.tags || []).join(", ")}</small>
    `;

    container.appendChild(div);
  });
}

document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.content.toLowerCase().includes(q) ||
    (a.tags || []).join(" ").toLowerCase().includes(q)
  );

  render(filtered);
});
