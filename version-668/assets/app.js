(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var thumbs = qsa("[data-hero-thumb]", hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        show(0);
        restart();
    }

    function initListFilters() {
        var panel = qs("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = qs("[data-filter-input]", panel);
        var yearSelect = qs("[data-filter-year]", panel);
        var typeSelect = qs("[data-filter-type]", panel);
        var cards = qsa("[data-card]");
        var empty = qs("[data-empty-state]");
        var years = [];
        var types = [];

        cards.forEach(function (card) {
            var year = card.getAttribute("data-year") || "";
            var type = card.getAttribute("data-type") || "";
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
            if (type && types.indexOf(type) === -1) {
                types.push(type);
            }
        });

        years.sort(function (a, b) {
            return Number(b) - Number(a);
        });
        types.sort();

        years.forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        types.forEach(function (type) {
            var option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        function apply() {
            var keyword = (input.value || "").trim().toLowerCase();
            var yearValue = yearSelect.value;
            var typeValue = typeSelect.value;
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
                var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
                var show = matchKeyword && matchYear && matchType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        input.addEventListener("input", apply);
        yearSelect.addEventListener("change", apply);
        typeSelect.addEventListener("change", apply);
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"card-cover\" href=\"./" + item.file + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-type\">" + escapeHtml(item.type) + "</span>" +
            "<span class=\"card-play\">▶</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<h3><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h3>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.category) + "</span></div>" +
            "<p>" + escapeHtml(item.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var input = qs("#search-input");
        var results = qs("#search-results");
        var empty = qs("#search-empty");
        if (!input || !results || !window.SearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var keyword = (input.value || "").trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = "";
                if (empty) {
                    empty.textContent = "输入关键词开始搜索";
                    empty.classList.add("is-visible");
                }
                return;
            }
            var matched = window.SearchIndex.filter(function (item) {
                return [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" ")].join(" ").toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(cardTemplate).join("");
            if (empty) {
                empty.textContent = "暂无匹配影片";
                empty.classList.toggle("is-visible", matched.length === 0);
            }
        }

        input.addEventListener("input", render);
        render();
    }

    window.initMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function bindSource() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                }
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                });
            }
            video.src = source;
            return Promise.resolve();
        }

        function play() {
            if (started) {
                return;
            }
            started = true;
            overlay.classList.add("is-hidden");
            bindSource().then(function () {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        overlay.classList.remove("is-hidden");
                        started = false;
                    });
                }
            });
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initHero();
        initListFilters();
        initSearchPage();
    });
})();
