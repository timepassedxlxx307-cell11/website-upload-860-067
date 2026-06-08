(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });

    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length > 0) {
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(target) {
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          startTimer();
        });
      }

      startTimer();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var list = scope.parentElement.querySelector("[data-movie-list]");
      if (!list) {
        return;
      }

      var keywordInput = scope.querySelector("[data-filter-keyword]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(list.children);

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function updateCards() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          var yearOk = !year || normalize(card.getAttribute("data-year")) === year;
          var regionOk = !region || normalize(card.getAttribute("data-region")) === region;
          var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle("is-filtered-out", !(yearOk && regionOk && keywordOk));
        });
      }

      [keywordInput, yearSelect, regionSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", updateCards);
          element.addEventListener("change", updateCards);
        }
      });
    });

    var searchResults = document.querySelector("[data-search-results]");
    var searchTitle = document.querySelector("[data-search-title]");
    if (searchResults && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var keyword = String(params.get("q") || "").trim().toLowerCase();
      var input = document.querySelector(".hero-search input[name='q']");
      if (input) {
        input.value = params.get("q") || "";
      }

      if (keyword) {
        var matched = window.SEARCH_INDEX.filter(function (item) {
          return [item.title, item.year, item.region, item.type, item.genre, item.tags, item.line].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 96);

        searchTitle.textContent = "搜索结果";
        searchResults.innerHTML = matched.map(function (item) {
          return [
            "<article class=\"movie-card grid\">",
            "<a class=\"card-poster poster-frame\" href=\"" + item.url + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">",
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "<span class=\"card-score\">" + item.score + "</span>",
            "</a>",
            "<div class=\"card-content\">",
            "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
            "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>",
            "<p>" + escapeHtml(item.line) + "</p>",
            "<div class=\"tag-row\">" + item.tags.split(" ").slice(0, 3).map(function (tag) { return "<span class=\"tag\">" + escapeHtml(tag) + "</span>"; }).join("") + "</div>",
            "</div>",
            "</article>"
          ].join("");
        }).join("");

        if (matched.length === 0) {
          searchResults.innerHTML = "<div class=\"text-card\"><h2>暂无匹配影片</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>";
        }

        searchResults.querySelectorAll("img").forEach(function (image) {
          image.addEventListener("error", function () {
            image.classList.add("image-missing");
          });
        });
      }
    }
  });

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }
})();
