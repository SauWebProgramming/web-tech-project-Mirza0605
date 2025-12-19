import { API_KEY, BASE_URL, IMG_URL } from "../config.js";

export async function loadMovies() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <section>
            <h1 class="section-title">Filmler</h1>

            <div class="filter-box">
                <div class="filter-row">

                    <div class="filter-group">
                        <i class="icon-search"></i>
                        <input type="search" id="movieSearch" placeholder="Film ara..." />
                    </div>

                    <div class="filter-group">
                        <select id="movieGenre">
                            <option value="">Tür</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <select id="movieYear">
                            <option value="">Yıl</option>
                        </select>
                    </div>

                    <button class="filter-btn" id="movieSearchBtn">Ara</button>
                </div>
            </div>

            <div id="moviesGrid" class="grid"></div>
        </section>
    `;

    const grid = document.getElementById("moviesGrid");

    const searchInput = document.getElementById("movieSearch");
    const searchBtn = document.getElementById("movieSearchBtn");
    const genreSelect = document.getElementById("movieGenre");
    const yearSelect = document.getElementById("movieYear");

    // 🎬 Türleri yükle
    let genres = [];
    try {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=tr-TR`);
        const data = await res.json();
        genres = data.genres || [];
        genres.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g.id;
            opt.textContent = g.name;
            genreSelect.appendChild(opt);
        });
    } catch {}

    // 📅 Yıl seçenekleri
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1980; y--) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }

    // 🎥 Film verisi çekme
    async function fetchMovies(urlBase) {
    grid.innerHTML = "Yükleniyor...";

    try {
        // 📌 1. ve 2. sayfa verisi çekiliyor
        const res1 = await fetch(urlBase + "&page=1");
        const res2 = await fetch(urlBase + "&page=2");

        const data1 = await res1.json();
        const data2 = await res2.json();

        // 📌 iki sayfa birleştiriliyor
        const allResults = [...(data1.results || []), ...(data2.results || [])];

        // 📌 sadece 30 film göster
        const results = allResults.slice(0, 30);

        grid.innerHTML = results
            .filter(x => x.poster_path)
            .map(m => `
                <article class="card" onclick="location.hash='#details?id=${m.id}&type=movie'">
                    <img src="${IMG_URL}${m.poster_path}">
                    <div class="card-body">
                        <h3 class="card-title">${m.title}</h3>
                        <div class="card-meta">
                            <span>${m.release_date?.slice(0,4) || "-"}</span>
                            <span>⭐ ${m.vote_average.toFixed(1)}</span>
                        </div>
                    </div>
                </article>
            `)
            .join("");

        } 
        catch (err) {
            console.error(err);
            grid.innerHTML = "<p>Bir hata oluştu.</p>";
        }
    }

    // Popüler filmler
   fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR`);

    //  Arama Butonu
    searchBtn.addEventListener("click", () => {
        const q = searchInput.value.trim();
        const g = genreSelect.value;
        const y = yearSelect.value;

        const params = new URLSearchParams();
        params.append("api_key", API_KEY);
        params.append("language", "tr-TR");

        if (q) params.append("query", q);
        if (g) params.append("with_genres", g);
        if (y) params.append("primary_release_year", y);

        const url = q
            ? `${BASE_URL}/search/movie?${params.toString()}`
            : `${BASE_URL}/discover/movie?${params.toString()}`;

        fetchMovies(url);
    });
}
