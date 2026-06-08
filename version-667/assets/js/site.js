(function () {
  function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      const opened = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!opened));
      panel.hidden = opened;
    });
  }

  function initHero() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    if (slides.length === 0) {
      return;
    }
    let active = 0;
    let timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === active);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function initFilters() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      const keyword = area.querySelector("[data-filter-keyword]");
      const type = area.querySelector("[data-filter-type]");
      const year = area.querySelector("[data-filter-year]");
      const cards = Array.from(area.querySelectorAll(".movie-card"));
      if (keyword && query && !keyword.value) {
        keyword.value = query;
      }
      function apply() {
        const q = keyword ? keyword.value.trim().toLowerCase() : "";
        const selectedType = type ? type.value : "";
        const selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          const cardType = card.getAttribute("data-type") || "";
          const cardYear = card.getAttribute("data-year") || "";
          const matchKeyword = !q || text.indexOf(q) !== -1;
          const matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
          const matchYear = !selectedYear || cardYear === selectedYear;
          card.classList.toggle("hidden-by-filter", !(matchKeyword && matchType && matchYear));
        });
      }
      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
