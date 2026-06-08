(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      button.classList.toggle('is-open', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.video-play-button');
      var source = player.getAttribute('data-video-src');
      var loaded = false;
      var hls = null;
      if (!video || !source) {
        return;
      }
      function loadSource() {
        if (loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      function playVideo() {
        loadSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
        player.classList.add('is-playing');
      }
      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var status = document.getElementById('search-status');
    if (!form || !input || !results || !status || !window.MOVIE_INDEX) {
      return;
    }
    function card(movie) {
      var meta = [movie.year, movie.region, movie.type].filter(Boolean).join(' / ');
      return [
        '<article class="movie-card">',
        '  <a href="' + escapeHtml(movie.url) + '" class="movie-cover">',
        '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-badge">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-meta">' + escapeHtml(meta) + '</p>',
        '    <p>' + escapeHtml(movie.summary) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }
    function render(query) {
      var keyword = String(query || '').trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '';
        status.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.summary
        ].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 72);
      status.textContent = matches.length ? '以下影片与关键词相关。' : '没有找到相关影片，请更换关键词。';
      results.innerHTML = matches.map(card).join('');
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value;
      var url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url.toString());
      render(query);
    });
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
      render(query);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPlayers();
    setupSearchPage();
  });
}());
