(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-to]'));
    var prev = carousel.querySelector('[data-slide-prev]');
    var next = carousel.querySelector('[data-slide-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var searchInput = document.querySelector('[data-search-input]');
  var searchGrid = document.querySelector('[data-search-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  function filterCards(value) {
    if (!searchGrid) {
      return;
    }

    var words = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = words.length === 0 || words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.value = query;
    filterCards(query);
    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value);
    });
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('.movie-player-video');
    var overlay = player.querySelector('.player-overlay');
    var streamUrl = player.getAttribute('data-stream');
    var hlsInstance = null;

    function attachStream() {
      if (!video || !streamUrl || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.setAttribute('data-ready', '1');
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }

      attachStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video && video.play ? video.play() : null;

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
