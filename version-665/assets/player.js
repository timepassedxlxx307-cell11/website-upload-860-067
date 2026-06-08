(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.querySelector(".movie-player");
    var cover = document.querySelector(".player-cover");
    if (!video || !cover) {
      return;
    }

    var source = video.getAttribute("data-hls-url") || "";
    var hlsInstance = null;
    var initialized = false;

    function initialize() {
      if (initialized || !source) {
        return;
      }
      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      initialize();
      cover.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", start);
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      cover.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
