(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    if (!forms.length) {
      return;
    }

    forms.forEach(function (form) {
      var params = new URLSearchParams(window.location.search);
      var keyword = form.querySelector("[data-filter-keyword]");
      var year = form.querySelector("[data-filter-year]");
      var region = form.querySelector("[data-filter-region]");
      var category = form.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var empty = document.querySelector("[data-empty]");

      if (keyword && params.get("q")) {
        keyword.value = params.get("q");
      }

      function text(value) {
        return String(value || "").trim().toLowerCase();
      }

      function matches(card) {
        var q = text(keyword && keyword.value);
        var y = text(year && year.value);
        var r = text(region && region.value);
        var c = text(category && category.value);
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();

        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (y && text(card.getAttribute("data-year")) !== y) {
          return false;
        }
        if (r && text(card.getAttribute("data-region")).indexOf(r) === -1) {
          return false;
        }
        if (c && text(card.getAttribute("data-category")) !== c) {
          return false;
        }
        return true;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      [keyword, year, region, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var errorBox = player.querySelector(".player-error");
      var source = video ? video.getAttribute("data-play-url") : "";
      var loaded = false;
      var hls = null;

      if (!video || !button || !source) {
        return;
      }

      function showError(message) {
        player.classList.add("has-error");
        if (errorBox) {
          errorBox.textContent = message;
        }
      }

      function attachSource() {
        if (loaded) {
          return true;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          loaded = true;
          return true;
        }

        if (typeof Hls !== "undefined" && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              showError("网络波动，正在重新加载");
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              showError("播放恢复中");
            } else {
              hls.destroy();
              showError("播放暂不可用");
            }
          });
          loaded = true;
          return true;
        }

        showError("播放暂不可用");
        return false;
      }

      function play() {
        if (!attachSource()) {
          return;
        }
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", toggle);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }
})();
