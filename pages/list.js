import { IMG_URL } from "../config.js";

export function loadList() {
    const app = document.getElementById("app");

    const list = JSON.parse(localStorage.getItem("mylist") || "[]");

   
    if (!list.length) {
        app.innerHTML = `
            <section class="empty-state">
                <h2>Listem</h2>
                <p>Henüz listenize bir içerik eklemediniz.</p>
            </section>
        `;
        return;
    }

    //  Boş değilse kartlı liste görünümü
    app.innerHTML = `
        <section>
            <h2 class="section-title">Listem</h2>
            <div id="myListGrid" class="grid"></div>
        </section>
    `;

    const grid = document.getElementById("myListGrid");

    //  Kartları çiz
    grid.innerHTML = list
        .map(item => `
            <article class="card">
                ${
                    item.poster
                        ? `<img src="${IMG_URL}${item.poster}" alt="${item.title}">`
                        : ""
                }
                <div class="card-body">
                    <h3 class="card-title">${item.title}</h3>

                    <div style="margin-top:0.4rem; display:flex; gap:0.4rem;">
                        <button class="btn" onclick="location.hash='#details?id=${item.id}&type=${item.type}'">
                            Detaya Git
                        </button>

                        <button class="btn remove-btn" data-id="${item.id}" data-type="${item.type}" style="background:#ff5252;color:#000;">
                            Kaldır
                        </button>
                    </div>
                </div>
            </article>
        `)
        .join("");

    //  Silme işlemi
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;

            let stored = JSON.parse(localStorage.getItem("mylist") || "[]");
            stored = stored.filter(x => !(x.id == id && x.type == type));

            localStorage.setItem("mylist", JSON.stringify(stored));

            loadList(); 
        });
    });
}
