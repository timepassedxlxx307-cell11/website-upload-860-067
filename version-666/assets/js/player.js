(function () {
  function initMoviePlayer(videoUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    if (!video) {
      return;
    }
    var hlsInstance = null;
    var start = function () {
      if (!video.getAttribute('data-ready')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
        video.setAttribute('data-ready', '1');
      }
      if (cover) {
        cover.classList.add('player-cover-hidden');
      }
      video.controls = true;
      var task = video.play();
      if (task && typeof task.catch === 'function') {
        task.catch(function () {});
      }
    };
    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!video.getAttribute('data-ready') || video.paused) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
  window.initMoviePlayer = initMoviePlayer;
})();
