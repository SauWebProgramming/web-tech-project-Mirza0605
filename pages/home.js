import { API_KEY, BASE_URL, IMG_URL } from "../config.js";

export async function loadHome() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <section>
         <h5 class="section-title" style="font-size:1.1rem;margin-bottom:0.75rem;">
                Son Popüler Film ve Diziler
            </h5>
            <div class="filter-box">
                <div class="filter-row">
                    <div class="filter-group">
                        <i class="icon-search"></i>
                        <input type="search" id="searchInput" placeholder="Film, dizi ara..." />
                    </div>

                    <div class="filter-group">
                        <select id="genreSelect">
                            <option value="">Tür</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <select id="yearSelect">
                            <option value="">Yıl</option>
                        </select>
                    </div>

                    <button id="searchBtn" class="filter-btn">Ara</button>
                </div>
            </div>

           
            <div id="moviesGrid" class="grid"></div>
        </section>
    `;

    const searchInput = document.getElementById("searchInput");
    const genreSelect = document.getElementById("genreSelect");
    const yearSelect = document.getElementById("yearSelect");
    const searchBtn = document.getElementById("searchBtn");
    const moviesGrid = document.getElementById("moviesGrid");

    // Yıllar
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1980; y--) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }

    // Türler
    let genres = [];
    const genreRes = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=tr-TR`);
    const genreData = await genreRes.json();
    genres = genreData.genres || [];
    genres.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.name;
        genreSelect.appendChild(opt);
    });

    
    async function fetchAndRender(url) {
        moviesGrid.innerHTML = "Yükleniyor...";
        let results = [];
        let page = 1;

        while (results.length < 30 && page <= 5) {
            const res = await fetch(`${url}&page=${page}`);
            const data = await res.json();
            if (data.results?.length) {
               
                const clean = data.results.filter(m => m.poster_path);
                results.push(...clean);
            }
            page++;
        }

        results = results.slice(0, 30);

        moviesGrid.innerHTML = results
            .map(m => createMovieCard(m))
            .join("");
    }

    function createMovieCard(movie) {
        const title = movie.title || movie.name || "Bilinmiyor";
        const year = movie.release_date?.slice(0, 4) ||
                     movie.first_air_date?.slice(0, 4) || "—";

        const vote = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

        return `
            <article class="card" onclick="location.hash='#details?id=${movie.id}&type=${movie.media_type}'">
                <img src="${IMG_URL}${movie.poster_path}" alt="${title}" loading="lazy" />
                <div class="card-body">
                    <h3 class="card-title">${title}</h3>
                    <div class="card-meta">
                        <span>${year}</span>
                        <span>⭐ ${vote}</span>
                    </div>
                </div>
            </article>
        `;
    }

    // Trending karışık liste
    const trendingUrl = `${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=tr-TR`;
    fetchAndRender(trendingUrl);

    // Arama
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        const selectedGenre = genreSelect.value;
        const selectedYear = yearSelect.value;

        if (query) {
            const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&include_adult=false`;
            fetchAndRender(url);
            return;
        }

        const params = new URLSearchParams();
        params.append("api_key", API_KEY);
        params.append("language", "tr-TR");
        params.append("sort_by", "popularity.desc");
        if (selectedGenre) params.append("with_genres", selectedGenre);
        if (selectedYear) params.append("primary_release_year", selectedYear);

        const url = `${BASE_URL}/discover/movie?${params.toString()}`;
        fetchAndRender(url);
    });
}
