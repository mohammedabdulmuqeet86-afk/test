import { Router } from 'express';

const router = Router();


// AJAX SEARCH (Global)

router.get('/search', (req, res) => {
  const db = req.app.locals.db;
  const query = req.query.q;

  if (!query || query.trim().length < 2) {
    return res.json({ habitats: [], exhibits: [], events: [] });
  }

  const searchTerm = `%${query.trim()}%`;

  const habitats = db.prepare(
    'SELECT id, name, slug, tagline, image, icon FROM habitats WHERE name LIKE ? OR description LIKE ? OR tagline LIKE ? LIMIT 5'
  ).all(searchTerm, searchTerm, searchTerm);

  const exhibits = db.prepare(
    'SELECT e.id, e.name, e.slug, e.description, e.image, e.type, h.name as habitat_name FROM exhibits e JOIN habitats h ON e.habitat_id = h.id WHERE e.name LIKE ? OR e.description LIKE ? LIMIT 5'
  ).all(searchTerm, searchTerm);

  const events = db.prepare(
    'SELECT id, title, slug, description, image, category, date, is_past FROM events WHERE title LIKE ? OR description LIKE ? LIMIT 5'
  ).all(searchTerm, searchTerm);

  res.json({ habitats, exhibits, events });
});


// AJAX HABITATS (Filter)

router.get('/habitats', (req, res) => {
  const db = req.app.locals.db;
  const { climate } = req.query;

  let habitats;
  if (climate && climate !== 'all') {
    habitats = db.prepare('SELECT * FROM habitats WHERE climate = ? ORDER BY id').all(climate);
  } else {
    habitats = db.prepare('SELECT * FROM habitats ORDER BY id').all();
  }

  res.json(habitats);
});


// AJAX EXHIBITS (Filter)

router.get('/exhibits', (req, res) => {
  const db = req.app.locals.db;
  const { habitat, type } = req.query;

  let sql = 'SELECT e.*, h.name as habitat_name, h.slug as habitat_slug FROM exhibits e JOIN habitats h ON e.habitat_id = h.id WHERE 1=1';
  const params = [];

  if (habitat && habitat !== 'all') {
    sql += ' AND e.habitat_id = ?';
    params.push(habitat);
  }
  if (type && type !== 'all') {
    sql += ' AND e.type = ?';
    params.push(type);
  }

  sql += ' ORDER BY e.id';
  const exhibits = db.prepare(sql).all(...params);
  res.json(exhibits);
});


// AJAX EVENTS (Filter by year and/or category)

router.get('/events', (req, res) => {
  const db = req.app.locals.db;
  const { year, category } = req.query;

  let sql = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (year && year !== 'all') {
    sql += ' AND year = ?';
    params.push(parseInt(year));
  }
  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY date ASC';
  const events = db.prepare(sql).all(...params);
  res.json(events);
});


// AJAX CONTACT FORM SUBMISSION

router.post('/contact', (req, res) => {
  const db = req.app.locals.db;
  const { name, email, subject, message } = req.body;

  // Server-side validation
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!subject || subject.trim().length < 2) {
    errors.push('Subject must be at least 2 characters long.');
  }
  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long.');
  }

  // Sanitise inputs (basic XSS prevention)
  const sanitise = (str) => str ? str.replace(/[<>]/g, '').trim() : '';

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)'
    );
    stmt.run(sanitise(name), sanitise(email), sanitise(subject), sanitise(message));

    res.json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ success: false, errors: ['An error occurred. Please try again later.'] });
  }
});


// AJAX FAQ SEARCH

router.get('/faqs', (req, res) => {
  const db = req.app.locals.db;
  const { q, category } = req.query;

  let sql = 'SELECT * FROM faqs WHERE 1=1';
  const params = [];

  if (q && q.trim().length > 0) {
    sql += ' AND (question LIKE ? OR answer LIKE ?)';
    const searchTerm = `%${q.trim()}%`;
    params.push(searchTerm, searchTerm);
  }
  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY sort_order';
  const faqs = db.prepare(sql).all(...params);
  res.json(faqs);
});

export default router;
