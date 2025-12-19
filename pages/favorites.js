import { API_KEY, BASE_URL, IMG_URL } from "../config.js";

export async function loadFavorites() {
    const app = document.getElementById("app");
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (!stored.length) {
        app.innerHTML = `
            <section class="empty-state">
                <h2>Favorilerim</h2>
                <p>Henüz favori eklemediniz.</p>
            </section>
        `;
        return;
    }

    app.innerHTML = `
        <section>
            <h1 class="section-title">Favorilerim</h1>
            <div id="favGrid" class="grid"></div>
        </section>
    `;

    const favGrid = document.getElementById("favGrid");

    async function fetchItem(item) {
        const res = await fetch(
            `${BASE_URL}/${item.type}/${item.id}?api_key=${API_KEY}&language=tr-TR`
        );
        return res.json();
    }

    try {
        const items = await Promise.all(stored.map(item => fetchItem(item)));

        favGrid.innerHTML = items
            .filter(m => m && m.id)
            .map(m => {
                const year =
                    m.release_date?.slice(0, 4) ||
                    m.first_air_date?.slice(0, 4) ||
                    "—";
                const vote = m.vote_average ? m.vote_average.toFixed(1) : "—";

                return `
                    <article class="card">
                        ${
                            m.poster_path
                                ? `<img src="${IMG_URL}${m.poster_path}" alt="${m.title || m.name}" />`
                                : ""
                        }
                        <div class="card-body">
                            <h3 class="card-title">${m.title || m.name}</h3>
                            <div class="card-meta">
                                <span>${year}</span>
                                <span>⭐ ${vote}</span>
                            </div>

                            <div style="margin-top:0.4rem; display:flex; gap:0.4rem;">
                                <button class="btn" onclick="location.hash='#details?id=${m.id}&type=${m.media_type || (m.name ? "tv" : "movie")}'">
                                    Detaya Git
                                </button>

                                <button class="btn remove-btn" data-id="${m.id}" data-type="${m.media_type || (m.name ? "tv" : "movie")}" style="background:#ff5252;color:#000;">Kaldır</button>
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");

        favGrid.addEventListener("click", (e) => {
            const btn = e.target.closest(".remove-btn");
            if (!btn) return;

            const id = btn.dataset.id;
            const type = btn.dataset.type;

            let list = JSON.parse(localStorage.getItem("favorites") || "[]");
            list = list.filter(x => !(x.id == id && x.type == type));
            localStorage.setItem("favorites", JSON.stringify(list));

            loadFavorites(); 
        });
    } catch (err) {
        console.error("Favoriler yüklenirken hata:", err);
        favGrid.innerHTML = "<p>Bir hata oluştu.</p>";
    }
}
