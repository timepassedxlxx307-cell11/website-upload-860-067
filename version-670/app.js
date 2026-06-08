document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".local-search"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector(".empty-state");
  var filters = {};

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function activeQuery() {
    var input = searchInputs.find(function (item) {
      return item.value.trim();
    });
    return normalize(input ? input.value : "");
  }

  function matchesFilters(card) {
    return Object.keys(filters).every(function (key) {
      var value = filters[key];
      return !value || value === "all" || card.getAttribute("data-" + key) === value;
    });
  }

  function applyCardFilter() {
    if (!cards.length) {
      return;
    }
    var query = activeQuery();
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var matched = (!query || text.indexOf(query) !== -1) && matchesFilters(card);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  if (query) {
    searchInputs.forEach(function (input) {
      input.value = query;
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyCardFilter);
  });

  Array.prototype.slice.call(document.querySelectorAll(".filter-chip")).forEach(function (chip) {
    chip.addEventListener("click", function () {
      var key = chip.getAttribute("data-filter");
      var value = chip.getAttribute("data-value");
      filters[key] = value;
      Array.prototype.slice.call(document.querySelectorAll('.filter-chip[data-filter="' + key + '"]')).forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });
      applyCardFilter();
    });
  });

  applyCardFilter();

  Array.prototype.slice.call(document.querySelectorAll(".player-shell[data-stream]")).forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var source = shell.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function bindVideo() {
      if (!video || !source || ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      bindVideo();
      shell.classList.add("is-playing");
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
});
