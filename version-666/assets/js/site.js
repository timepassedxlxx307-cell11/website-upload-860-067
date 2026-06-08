(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === active);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === active);
      });
    };
    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
      });
    });
    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  var categorySearch = document.querySelector('[data-category-search]');
  if (categorySearch) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    categorySearch.addEventListener('input', function () {
      var keyword = categorySearch.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-summary')).toLowerCase();
        card.style.display = haystack.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }
})();
