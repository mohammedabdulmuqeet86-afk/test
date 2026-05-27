import { Router } from 'express';

const router = Router();


// HOME PAGE

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const featuredHabitats = db.prepare('SELECT * FROM habitats WHERE featured = 1 ORDER BY id').all();
  const featuredExhibits = db.prepare('SELECT e.*, h.name as habitat_name FROM exhibits e JOIN habitats h ON e.habitat_id = h.id WHERE e.featured = 1 ORDER BY e.id LIMIT 6').all();
  const upcomingEvents = db.prepare('SELECT * FROM events WHERE is_past = 0 ORDER BY date ASC LIMIT 3').all();

  res.render('index', {
    title: 'WildHaven Adventure Park | Eco-Adventure Wildlife Experience',
    pageId: 'home',
    habitats: featuredHabitats,
    exhibits: featuredExhibits,
    events: upcomingEvents
  });
});


// HABITATS

router.get('/habitats', (req, res) => {
  const db = req.app.locals.db;
  const habitats = db.prepare('SELECT * FROM habitats ORDER BY id').all();
  const climates = db.prepare('SELECT DISTINCT climate FROM habitats ORDER BY climate').all();

  res.render('habitats', {
    title: 'Our Habitats | WildHaven Adventure Park',
    pageId: 'habitats',
    habitats,
    climates
  });
});

router.get('/habitats/:slug', (req, res) => {
  const db = req.app.locals.db;
  const habitat = db.prepare('SELECT * FROM habitats WHERE slug = ?').get(req.params.slug);

  if (!habitat) {
    return res.status(404).render('404', {
      title: '404 - Habitat Not Found | WildHaven Adventure Park',
      pageId: 'not-found'
    });
  }

  const exhibits = db.prepare('SELECT * FROM exhibits WHERE habitat_id = ? ORDER BY id').all(habitat.id);
  const animals = db.prepare('SELECT * FROM animals WHERE habitat_id = ? ORDER BY id').all(habitat.id);
  const events = db.prepare('SELECT * FROM events WHERE habitat_id = ? AND is_past = 0 ORDER BY date ASC LIMIT 3').all(habitat.id);

  res.render('habitat-detail', {
    title: `${habitat.name} | WildHaven Adventure Park`,
    pageId: 'habitats',
    habitat,
    exhibits,
    animals,
    events
  });
});


// EXHIBITS / EXPERIENCES

router.get('/exhibits', (req, res) => {
  const db = req.app.locals.db;
  const exhibits = db.prepare('SELECT e.*, h.name as habitat_name, h.slug as habitat_slug FROM exhibits e JOIN habitats h ON e.habitat_id = h.id ORDER BY e.id').all();
  const habitats = db.prepare('SELECT id, name FROM habitats ORDER BY name').all();
  const types = db.prepare('SELECT DISTINCT type FROM exhibits ORDER BY type').all();

  res.render('exhibits', {
    title: 'Experiences & Exhibits | WildHaven Adventure Park',
    pageId: 'exhibits',
    exhibits,
    habitats,
    types
  });
});


// FAQ

router.get('/faq', (req, res) => {
  const db = req.app.locals.db;
  const faqs = db.prepare('SELECT * FROM faqs ORDER BY sort_order').all();
  const categories = db.prepare('SELECT DISTINCT category FROM faqs ORDER BY category').all();

  res.render('faq', {
    title: 'Frequently Asked Questions | WildHaven Adventure Park',
    pageId: 'faq',
    faqs,
    categories
  });
});


// CONTACT

router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us | WildHaven Adventure Park',
    pageId: 'contact'
  });
});


// INTERACTIVE ACTIVITY

router.get('/activity', (req, res) => {
  const db = req.app.locals.db;
  const animals = db.prepare('SELECT name, image, species, habitat_id FROM animals ORDER BY RANDOM()').all();

  res.render('activity', {
    title: 'Wildlife Spotter Game | WildHaven Adventure Park',
    pageId: 'activity',
    animals
  });
});


// EVENTS

router.get('/events', (req, res) => {
  const db = req.app.locals.db;
  const currentYear = new Date().getFullYear();
  const events = db.prepare('SELECT * FROM events WHERE year = ? ORDER BY date ASC').all(currentYear);
  const years = db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
  const categories = db.prepare('SELECT DISTINCT category FROM events ORDER BY category').all();

  res.render('events', {
    title: 'Events & Special Experiences | WildHaven Adventure Park',
    pageId: 'events',
    events,
    years,
    categories,
    selectedYear: currentYear,
    selectedCategory: 'all'
  });
});

router.get('/events/:slug', (req, res) => {
  const db = req.app.locals.db;
  const event = db.prepare('SELECT e.*, h.name as habitat_name, h.slug as habitat_slug FROM events e LEFT JOIN habitats h ON e.habitat_id = h.id WHERE e.slug = ?').get(req.params.slug);

  if (!event) {
    return res.status(404).render('404', {
      title: '404 - Event Not Found | WildHaven Adventure Park',
      pageId: 'not-found'
    });
  }

  const relatedEvents = db.prepare('SELECT * FROM events WHERE category = ? AND id != ? ORDER BY date DESC LIMIT 3').all(event.category, event.id);

  res.render('event-detail', {
    title: `${event.title} | WildHaven Adventure Park`,
    pageId: 'events',
    event,
    relatedEvents
  });
});

export default router;
