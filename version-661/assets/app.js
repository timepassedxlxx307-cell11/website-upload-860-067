(() => {
    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    };

    ready(() => {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });

    function initNavigation() {
        const toggle = document.querySelector("[data-nav-toggle]");
        const menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", () => {
            const open = !document.body.classList.contains("nav-open");
            document.body.classList.toggle("nav-open", open);
            toggle.setAttribute("aria-expanded", String(open));
        });
        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                document.body.classList.remove("nav-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        if (slides.length === 0) {
            return;
        }
        let active = 0;
        let timer = null;
        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };
        const start = () => {
            stop();
            timer = window.setInterval(() => show(active + 1), 6500);
        };
        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                start();
            });
        });
        if (previous) {
            previous.addEventListener("click", () => {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", () => {
                show(active + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
        if (scopes.length === 0) {
            return;
        }
        const urlQuery = new URLSearchParams(window.location.search).get("q") || "";
        scopes.forEach((scope) => {
            const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
            const search = scope.querySelector("[data-search-input]");
            const genre = scope.querySelector("[data-genre-filter]");
            const region = scope.querySelector("[data-region-filter]");
            const type = scope.querySelector("[data-type-filter]");
            const clear = scope.querySelector("[data-clear-filters]");
            const empty = scope.querySelector("[data-empty-state]");
            if (search && urlQuery && scope.hasAttribute("data-main-library")) {
                search.value = urlQuery;
            }
            const apply = () => {
                const text = search ? search.value.trim().toLowerCase() : "";
                const genreValue = genre ? genre.value : "";
                const regionValue = region ? region.value : "";
                const typeValue = type ? type.value : "";
                let visible = 0;
                cards.forEach((card) => {
                    const haystack = (card.dataset.search || "").toLowerCase();
                    const cardGenre = card.dataset.genre || "";
                    const cardRegion = card.dataset.region || "";
                    const cardType = card.dataset.type || "";
                    const matched =
                        (!text || haystack.includes(text)) &&
                        (!genreValue || cardGenre.includes(genreValue)) &&
                        (!regionValue || cardRegion.includes(regionValue)) &&
                        (!typeValue || cardType.includes(typeValue));
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            };
            [search, genre, region, type].forEach((control) => {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            if (clear) {
                clear.addEventListener("click", () => {
                    if (search) {
                        search.value = "";
                    }
                    if (genre) {
                        genre.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function initPlayers() {
        const players = Array.from(document.querySelectorAll("[data-player]"));
        players.forEach((player) => {
            const video = player.querySelector("video");
            const cover = player.querySelector("[data-player-cover]");
            const start = player.querySelector("[data-player-start]");
            const videoUrl = player.dataset.videoUrl;
            let loaded = false;
            if (!video || !videoUrl) {
                return;
            }
            const attach = () => {
                if (loaded) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    video.hlsController = hls;
                } else {
                    video.src = videoUrl;
                }
                video.controls = true;
                loaded = true;
            };
            const play = () => {
                attach();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                const request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(() => {});
                }
            };
            if (start) {
                start.addEventListener("click", play);
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", () => {
                if (!loaded) {
                    play();
                }
            });
        });
    }
})();
