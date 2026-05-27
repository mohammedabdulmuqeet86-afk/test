

document.addEventListener('DOMContentLoaded', function () {

  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('active');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav when clicking a link
    mainNav.querySelectorAll('.main-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function (e) {
      if (mainNav.classList.contains('active') &&
          !mainNav.contains(e.target) &&
          !navToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }


  const searchInput = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');
  let searchDebounce;

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchDebounce);
      const query = this.value.trim();

      if (query.length < 2) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }

      searchDebounce = setTimeout(function () {
        fetch('/api/search?q=' + encodeURIComponent(query))
          .then(function (res) { return res.json(); })
          .then(function (data) {
            renderSearchResults(data, query);
          })
          .catch(function (err) {
            console.error('Search error:', err);
          });
      }, 300);
    });

    // Close search results when clicking outside
    document.addEventListener('click', function (e) {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.remove('active');
      }
    });

    // Re-open on focus if there is content
    searchInput.addEventListener('focus', function () {
      if (searchResults.innerHTML.trim() !== '') {
        searchResults.classList.add('active');
      }
    });
  }

  function renderSearchResults(data, query) {
    var html = '';
    var hasResults = false;

    // Habitats
    if (data.habitats && data.habitats.length > 0) {
      hasResults = true;
      html += '<div class="search-results__category">Habitats</div>';
      data.habitats.forEach(function (h) {
        html += '<a href="/habitats/' + h.slug + '" class="search-results__item">' +
          '<img src="' + h.image + '" alt="' + h.name + '" class="search-results__item-image">' +
          '<div class="search-results__item-info">' +
            '<div class="search-results__item-title">' + h.name + '</div>' +
            '<div class="search-results__item-meta">' + h.tagline + '</div>' +
          '</div>' +
        '</a>';
      });
    }

    // Exhibits
    if (data.exhibits && data.exhibits.length > 0) {
      hasResults = true;
      html += '<div class="search-results__category">Experiences</div>';
      data.exhibits.forEach(function (e) {
        html += '<a href="/exhibits" class="search-results__item">' +
          '<img src="' + e.image + '" alt="' + e.name + '" class="search-results__item-image">' +
          '<div class="search-results__item-info">' +
            '<div class="search-results__item-title">' + e.name + '</div>' +
            '<div class="search-results__item-meta">' + e.habitat_name + ' · ' + e.type + '</div>' +
          '</div>' +
        '</a>';
      });
    }

    // Events
    if (data.events && data.events.length > 0) {
      hasResults = true;
      html += '<div class="search-results__category">Events</div>';
      data.events.forEach(function (ev) {
        html += '<a href="/events/' + ev.slug + '" class="search-results__item">' +
          '<img src="' + ev.image + '" alt="' + ev.title + '" class="search-results__item-image">' +
          '<div class="search-results__item-info">' +
            '<div class="search-results__item-title">' + ev.title + '</div>' +
            '<div class="search-results__item-meta">' + ev.category + ' · ' + ev.date + '</div>' +
          '</div>' +
        '</a>';
      });
    }

    if (!hasResults) {
      html = '<div class="search-results__empty">No results found for "' + query + '"</div>';
    }

    searchResults.innerHTML = html;
    searchResults.classList.add('active');
  }


  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards for scroll animations
  document.querySelectorAll('.habitat-card, .exhibit-card, .event-card, .animal-card, .info-banner__item').forEach(function (el) {
    el.style.opacity = '0';
    observer.observe(el);
  });

  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      } else {
        header.style.boxShadow = '';
      }
    }, { passive: true });
  }

});
