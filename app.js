import { loadHome } from "./pages/home.js";
import { loadDetails } from "./pages/details.js";
import { loadFavorites } from "./pages/favorites.js";
import { loadMovies } from "./pages/movies.js";
import { loadSeries } from "./pages/series.js";
import { loadList } from "./pages/list.js";

const app = document.getElementById("app");

function router() {
    const hash = window.location.hash || "#home";

    if (hash === "#mylist") return loadList();

    if (hash === "#movies") return loadMovies();

    if (hash === "#series") return loadSeries();

    if (hash.startsWith("#details")) {
        loadDetails();
    } else if (hash === "#favorites") {
        loadFavorites();
    } else {
        loadHome();
    }
}

// Mobil menü
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
        navMenu.classList.toggle("show");
    });

    navMenu.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            navMenu.classList.remove("show");
        }
    });
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
