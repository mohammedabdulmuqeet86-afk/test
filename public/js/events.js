

document.addEventListener('DOMContentLoaded', function () {
  var yearFilter = document.getElementById('year-filter');
  var categoryFilter = document.getElementById('category-filter');
  var grid = document.getElementById('events-grid');
  var noResults = document.getElementById('no-results-events');
  var eventsCount = document.getElementById('events-count');

  if (!grid || !yearFilter || !categoryFilter) return;

  yearFilter.addEventListener('change', fetchEvents);
  categoryFilter.addEventListener('change', fetchEvents);

  function fetchEvents() {
    var year = yearFilter.value;
    var category = categoryFilter.value;
    var params = new URLSearchParams();

    if (year !== 'all') params.set('year', year);
    if (category !== 'all') params.set('category', category);

    fetch('/api/events?' + params.toString())
      .then(function (res) { return res.json(); })
      .then(function (events) {
        // Update count
        eventsCount.textContent = events.length + ' event' + (events.length !== 1 ? 's' : '') + ' found';

        if (events.length === 0) {
          grid.innerHTML = '';
          noResults.style.display = 'block';
          return;
        }

        noResults.style.display = 'none';
        grid.innerHTML = events.map(function (ev) {
          var eventDate = new Date(ev.date);
          var day = eventDate.getDate();
          var month = eventDate.toLocaleString('en-GB', { month: 'short' });
          var statusBadge = ev.is_past
            ? '<span class="event-card__status-badge event-card__status-badge--past">Past Event</span>'
            : '<span class="event-card__status-badge event-card__status-badge--upcoming">Upcoming</span>';

          return '<a href="/events/' + ev.slug + '" class="event-card event-card--full fade-in" id="event-card-' + ev.id + '">' +
            '<div class="event-card__image-wrapper">' +
              '<img src="' + ev.image + '" alt="' + escapeHtml(ev.title) + '" class="event-card__image" loading="lazy">' +
              '<span class="event-card__category-badge">' + escapeHtml(ev.category) + '</span>' +
              statusBadge +
            '</div>' +
            '<div class="event-card__content">' +
              '<div class="event-card__date">' +
                '<span class="event-card__date-day">' + day + '</span>' +
                '<span class="event-card__date-month">' + month + '</span>' +
                '<span class="event-card__date-year">' + ev.year + '</span>' +
              '</div>' +
              '<div class="event-card__info">' +
                '<h2 class="event-card__title">' + escapeHtml(ev.title) + '</h2>' +
                '<p class="event-card__desc">' + escapeHtml(ev.description) + '</p>' +
                '<div class="event-card__meta">' +
                  '<span class="event-card__time">' + escapeHtml(ev.time) + '</span>' +
                  '<span class="event-card__location">' + escapeHtml(ev.location) + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</a>';
        }).join('');
      })
      .catch(function (err) {
        console.error('Events filter error:', err);
      });
  }

  /**
   * Escape HTML to prevent XSS when rendering dynamic content
   */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
});
