(function () {
  function setupPlayer(streamUrl, videoSelector, overlaySelector, buttonSelector) {
    const video = document.querySelector(videoSelector);
    const overlay = document.querySelector(overlaySelector);
    const button = document.querySelector(buttonSelector);
    if (!video || !overlay || !button || !streamUrl) {
      return;
    }
    let ready = false;
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = streamUrl;
      }
    }
    async function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;
      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    }
    button.addEventListener("click", play);
    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  }
  window.setupPlayer = setupPlayer;
})();
