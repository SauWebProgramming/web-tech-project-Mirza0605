import { API_KEY, BASE_URL, IMG_URL } from "../config.js";

export async function loadSeries() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <section>
            <h1 class="section-title">Diziler</h1>

            <div class="filter-box">
                <div class="filter-row">

                    <div class="filter-group">
                        <i class="icon-search"></i>
                        <input type="search" id="seriesSearch" placeholder="Dizi ara..." />
                    </div>

                    <div class="filter-group">
                        <select id="seriesGenre">
                            <option value="">Tür</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <select id="seriesYear">
                            <option value="">Yıl</option>
                        </select>
                    </div>

                    <button class="filter-btn" id="seriesSearchBtn">Ara</button>
                </div>
            </div>

            <div id="seriesGrid" class="grid"></div>
        </section>
    `;

    const grid = document.getElementById("seriesGrid");

    const searchInput = document.getElementById("seriesSearch");
    const searchBtn = document.getElementById("seriesSearchBtn");
    const genreSelect = document.getElementById("seriesGenre");
    const yearSelect = document.getElementById("seriesYear");

    // 🎭 Dizi türleri yükle
    let genres = [];
    try {
        const res = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=tr-TR`);
        const data = await res.json();
        genres = data.genres || [];
        genres.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g.id;
            opt.textContent = g.name;
            genreSelect.appendChild(opt);
        });
    } catch {}

    //  Yıllar
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1980; y--) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }

    //  Dizi verisi çekme
    async function fetchSeries(urlBase) {
    grid.innerHTML = "Yükleniyor...";

    try {
        // 📌 İlk 2 sayfayı çekiyoruz
        const res1 = await fetch(urlBase + "&page=1");
        const res2 = await fetch(urlBase + "&page=2");

        const data1 = await res1.json();
        const data2 = await res2.json();

        // 📌 iki sayfanın sonuçlarını birleştiriyoruz
        const allResults = [...(data1.results || []), ...(data2.results || [])];

        // 📌 sadece ilk 30 dizi
        const results = allResults.slice(0, 30);

        grid.innerHTML = results
            .filter(x => x.poster_path)
            .map(tv => `
                <article class="card" onclick="location.hash='#details?id=${tv.id}&type=tv'">
                    <img src="${IMG_URL}${tv.poster_path}">
                    <div class="card-body">
                        <h3 class="card-title">${tv.name}</h3>
                        <div class="card-meta">
                            <span>${tv.first_air_date?.slice(0,4) || "-"}</span>
                            <span>⭐ ${tv.vote_average?.toFixed(1) || "?"}</span>
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

    // Popüler diziler
    fetchSeries(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=tr-TR`);

    // Ara
    searchBtn.addEventListener("click", () => {
        const q = searchInput.value.trim();
        const g = genreSelect.value;
        const y = yearSelect.value;

        const params = new URLSearchParams();
        params.append("api_key", API_KEY);
        params.append("language", "tr-TR");

        if (q) params.append("query", q);
        if (g) params.append("with_genres", g);
        if (y) params.append("first_air_date_year", y);

        const url = q
            ? `${BASE_URL}/search/tv?${params.toString()}`
            : `${BASE_URL}/discover/tv?${params.toString()}`;

        fetchSeries(url);
    });
}
