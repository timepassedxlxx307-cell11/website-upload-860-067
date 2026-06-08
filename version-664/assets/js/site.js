(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-mobile-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
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

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.closest("section") || document;
            var items = Array.prototype.slice.call(scope.querySelectorAll(".filter-item"));
            var search = panel.querySelector("[data-filter-search]");
            var reset = panel.querySelector("[data-filter-reset]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
            var empty = scope.querySelector("[data-no-results]");
            var params = new URLSearchParams(window.location.search);
            var incomingQuery = params.get("q") || "";

            if (search && incomingQuery) {
                search.value = incomingQuery;
            }

            function text(value) {
                return String(value || "").toLowerCase().trim();
            }

            function matchesSelect(item, select) {
                var value = select.value;
                if (!value) {
                    return true;
                }
                return item.getAttribute("data-" + select.getAttribute("data-filter-field")) === value;
            }

            function apply() {
                var query = search ? text(search.value) : "";
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = text(item.getAttribute("data-search"));
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchFields = selects.every(function (select) {
                        return matchesSelect(item, select);
                    });
                    var show = matchText && matchFields;
                    item.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    apply();
                });
            }

            apply();
        });
    });
})();
