

document.addEventListener('DOMContentLoaded', function () {
  var habitatFilter = document.getElementById('habitat-filter');
  var typeFilter = document.getElementById('type-filter');
  var grid = document.getElementById('exhibits-grid');
  var noResults = document.getElementById('no-results-exhibits');

  if (!grid || !habitatFilter || !typeFilter) return;

  habitatFilter.addEventListener('change', fetchExhibits);
  typeFilter.addEventListener('change', fetchExhibits);

  function fetchExhibits() {
    var habitat = habitatFilter.value;
    var type = typeFilter.value;
    var params = new URLSearchParams();

    if (habitat !== 'all') params.set('habitat', habitat);
    if (type !== 'all') params.set('type', type);

    fetch('/api/exhibits?' + params.toString())
      .then(function (res) { return res.json(); })
      .then(function (exhibits) {
        if (exhibits.length === 0) {
          grid.innerHTML = '';
          noResults.style.display = 'block';
          return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = exhibits.map(function (e) {
          var metaHtml = '';
          if (e.duration) {
            metaHtml += '<span class="exhibit-card__meta-item">' + e.duration + '</span>';
          }
          if (e.difficulty) {
            metaHtml += '<span class="exhibit-card__meta-item">' + e.difficulty + '</span>';
          }

          return '<article class="exhibit-card fade-in" id="exhibit-card-' + e.id + '">' +
            '<div class="exhibit-card__image-wrapper">' +
              '<img src="' + e.image + '" alt="' + e.name + ' experience at WildHaven" class="exhibit-card__image" loading="lazy">' +
              '<span class="exhibit-card__type-badge exhibit-card__type-badge--' + e.type + '">' + e.type + '</span>' +
            '</div>' +
            '<div class="exhibit-card__content">' +
              '<a href="/habitats/' + e.habitat_slug + '" class="exhibit-card__habitat">' + e.habitat_name + '</a>' +
              '<h2 class="exhibit-card__title">' + e.name + '</h2>' +
              '<p class="exhibit-card__desc">' + e.description + '</p>' +
              '<div class="exhibit-card__meta">' + metaHtml + '</div>' +
            '</div>' +
          '</article>';
        }).join('');
      })
      .catch(function (err) {
        console.error('Exhibit filter error:', err);
      });
  }
});
