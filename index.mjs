import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/seed.mjs';
import pageRoutes from './routes/pages.mjs';
import apiRoutes from './routes/api.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Initialise the database (creates tables and seeds data if empty)
const db = initDatabase(__dirname);

// Make db available to routes
app.locals.db = db;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Make current year and path available to all templates
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found | WildHaven Adventure Park',
    pageId: 'not-found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).send('Something went wrong. Please try again later.');
});

app.listen(PORT, () => {
  console.log(`\n WildHaven Adventure Park is running!`);
  console.log(` Visit: http://localhost:${PORT}`);
});
