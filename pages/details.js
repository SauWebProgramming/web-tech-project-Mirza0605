import { API_KEY, BASE_URL, IMG_URL } from "../config.js";

export async function loadDetails() {
    const app = document.getElementById("app");

    const params = new URLSearchParams(location.hash.split("?")[1]);
    const id = params.get("id");
    const type = params.get("type") || "movie";

    if (!id) {
        app.innerHTML = "<p>Film/Dizi bulunamadı.</p>";
        return;
    }

    app.innerHTML = "<p>Yükleniyor...</p>";

    try {
        const [movieRes, creditsRes] = await Promise.all([
            fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=tr-TR`),
            fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=tr-TR`)
        ]);

        const movie = await movieRes.json();
        const credits = await creditsRes.json();

        const year =
            movie.release_date?.slice(0, 4) ||
            movie.first_air_date?.slice(0, 4) ||
            "—";

        const vote = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
        const genres = (movie.genres || []).map(g => g.name).join(", ");
        const castNames = (credits.cast || []).slice(0, 5).map(c => c.name).join(", ");

        app.innerHTML = `
            <section>
                <button class="btn" onclick="history.back()">&larr; Geri</button>

                <div class="details-layout">
                    <div>
                        ${movie.poster_path ? `<img src="${IMG_URL}${movie.poster_path}" class="details-poster" />` : ""}
                    </div>

                    <div class="details-main">
                        <h2>${movie.title || movie.name}</h2>

                        <div class="details-meta">
                            <span class="chip">Yıl: ${year}</span>
                            <span class="chip">Puan: ⭐ ${vote}</span>
                            ${genres ? `<span class="chip">${genres}</span>` : ""}
                        </div>

                        <p class="details-overview">${movie.overview || "Özet yok."}</p>

                        ${castNames ? `<p><strong>Oyuncular:</strong> ${castNames}</p>` : ""}

                        <button class="btn" id="favBtn">Favorilere Ekle</button>
                        <button class="btn" id="listBtn">Listeme Ekle</button>
                    </div>
                </div>
            </section>
        `;

        /* LISTEME EKLE */ 
const listBtn = document.getElementById("listBtn");
let myList = JSON.parse(localStorage.getItem("mylist") || "[]");

let inList = myList.some(item => item.id == id && item.type == type);

// İlk görünüm
if (inList) {
    listBtn.textContent = "Listemde ";
    listBtn.classList.add("fav-active"); 
}


listBtn.addEventListener("click", () => {

    // Eğer listede varsa → kaldır
    if (inList) {
        myList = myList.filter(item => !(item.id == id && item.type == type));
        localStorage.setItem("mylist", JSON.stringify(myList));

        listBtn.textContent = "Listeme Ekle";
        listBtn.classList.remove("fav-active");

        inList = false;
        return;
    }

    // Eğer listede değilse → ekle**
    myList.push({
        id,
        type,
        title: movie.title || movie.name,
        poster: movie.poster_path
    });

    localStorage.setItem("mylist", JSON.stringify(myList));

    listBtn.textContent = "Listemde ";
    listBtn.classList.add("fav-active");

    inList = true;
});

        
        const favBtn = document.getElementById("favBtn");
        let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

        function updateFavButton() {
            const isFav = favorites.some(f => f.id == id && f.type == type);
            
            if (isFav) {
                favBtn.textContent = "Favorilerde ";
                favBtn.classList.add("fav-active");
            } else {
                favBtn.textContent = "Favorilere Ekle";
                favBtn.classList.remove("fav-active");
            }
        }

        // İlk buton durumu
        updateFavButton();

        favBtn.addEventListener("click", () => {
            const isFav = favorites.some(f => f.id == id && f.type == type);

            if (isFav) {
                // Favoriden çıkar
                favorites = favorites.filter(f => !(f.id == id && f.type == type));
            } else {
                // Favoriye ekle
                favorites.push({
                    id,
                    type,
                    title: movie.title || movie.name,
                    poster: movie.poster_path
                });
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));

            // Butonu güncelle
            updateFavButton();
        });

    } catch (err) {
        console.error("Detay alınırken hata:", err);
        app.innerHTML = "<p>Bir hata oluştu.</p>";
    }
}
