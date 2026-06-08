(function () {
  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 2).map(function (tag) {
      return '<span class="tag-chip">' + escapeText(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + movie.file + '">' +
      '<div class="movie-cover">' +
      '<img src="' + movie.cover + '" alt="' + escapeText(movie.title) + '" loading="lazy">' +
      '<span class="pill cover-pill">' + escapeText(movie.category) + '</span>' +
      '<div class="cover-meta"><span>' + escapeText(movie.duration) + '</span><span>' + escapeText(movie.year) + '</span></div>' +
      '</div>' +
      '<div class="movie-body">' +
      '<h2 class="movie-title">' + escapeText(movie.title) + '</h2>' +
      '<p class="movie-line">' + escapeText(movie.oneLine) + '</p>' +
      '<div class="movie-foot"><span>' + escapeText(movie.publishDate) + '</span><span class="tag-row">' + tags + '</span></div>' +
      '</div>' +
      '</a>';
  }

  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var hotTags = Array.prototype.slice.call(document.querySelectorAll('[data-hot-query]'));
  if (!input || !results || !window.SEARCH_MOVIES) {
    return;
  }

  function render(keyword) {
    var term = keyword.trim().toLowerCase();
    if (!term) {
      results.innerHTML = '<div class="empty-state"><h2>开始搜索</h2><p>输入片名、类型、地区或剧情关键词，快速找到想看的影视内容。</p></div>';
      return;
    }
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.searchText.indexOf(term) >= 0;
    }).slice(0, 120);
    if (!matched.length) {
      results.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>可尝试更换片名、类型、地区或剧情关键词。</p></div>';
      return;
    }
    results.innerHTML = matched.map(card).join('');
  }

  input.addEventListener('input', function () {
    render(input.value);
  });
  hotTags.forEach(function (item) {
    item.addEventListener('click', function () {
      input.value = item.getAttribute('data-hot-query');
      render(input.value);
      input.focus();
    });
  });
  render(input.value);
})();
