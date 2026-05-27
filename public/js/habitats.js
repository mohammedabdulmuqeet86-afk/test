

document.addEventListener('DOMContentLoaded', function () {
  var filterButtons = document.querySelectorAll('#climate-filter-buttons .filter-btn');
  var grid = document.getElementById('habitats-grid');
  var noResults = document.getElementById('no-results-habitats');

  if (!grid || filterButtons.length === 0) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active button state
      filterButtons.forEach(function (b) { b.classList.remove('filter-btn--active'); });
      this.classList.add('filter-btn--active');

      var climate = this.getAttribute('data-climate');
      fetchHabitats(climate);
    });
  });

  function fetchHabitats(climate) {
    var url = '/api/habitats';
    if (climate && climate !== 'all') {
      url += '?climate=' + encodeURIComponent(climate);
    }

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (habitats) {
        if (habitats.length === 0) {
          grid.innerHTML = '';
          noResults.style.display = 'block';
          return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = habitats.map(function (h) {
          return '<a href="/habitats/' + h.slug + '" class="habitat-card habitat-card--large fade-in" id="habitat-card-' + h.id + '">' +
            '<div class="habitat-card__image-wrapper">' +
              '<img src="' + h.image + '" alt="' + h.name + ' habitat at WildHaven Adventure Park" class="habitat-card__image" loading="lazy">' +
              '<div class="habitat-card__overlay"></div>' +
            '</div>' +
            '<div class="habitat-card__content">' +
              '<h2 class="habitat-card__title">' + h.name + '</h2>' +
              '<p class="habitat-card__tagline">' + h.tagline + '</p>' +
              '<span class="habitat-card__climate-badge">' + h.climate + '</span>' +
              '<p class="habitat-card__desc">' + h.description.substring(0, 150) + '...</p>' +
              '<span class="btn btn--small btn--primary">Explore Habitat →</span>' +
            '</div>' +
          '</a>';
        }).join('');
      })
      .catch(function (err) {
        console.error('Habitat filter error:', err);
      });
  }
});
