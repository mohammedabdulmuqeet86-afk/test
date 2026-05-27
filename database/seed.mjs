import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Initialises the SQLite database, creates tables, and seeds data if empty.
 * @param {string} rootDir - The project root directory
 * @returns {Database} The database instance
 */
export function initDatabase(rootDir) {
  const dbDir = path.join(rootDir, 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'wildlife.db');
  const db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS habitats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      banner_image TEXT NOT NULL,
      climate TEXT NOT NULL,
      icon TEXT NOT NULL,
      featured INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exhibits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitat_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      image TEXT NOT NULL,
      duration TEXT,
      difficulty TEXT,
      featured INTEGER DEFAULT 0,
      FOREIGN KEY (habitat_id) REFERENCES habitats(id)
    );

    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitat_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      conservation_status TEXT,
      FOREIGN KEY (habitat_id) REFERENCES habitats(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitat_id INTEGER,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      year INTEGER NOT NULL,
      is_past INTEGER DEFAULT 0,
      FOREIGN KEY (habitat_id) REFERENCES habitats(id)
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Seed data only if habitats table is empty
  const count = db.prepare('SELECT COUNT(*) as cnt FROM habitats').get();
  if (count.cnt === 0) {
    seedData(db);
  }

  return db;
}

function seedData(db) {
  // ──────────────────────────────────────────────
  // HABITATS
  // ──────────────────────────────────────────────
  const insertHabitat = db.prepare(`
    INSERT INTO habitats (name, slug, tagline, description, image, banner_image, climate, icon, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const habitats = [
    {
      name: 'Rainforest Canopy',
      slug: 'rainforest-canopy',
      tagline: 'Journey into the heart of the jungle',
      description: 'Immerse yourself in a lush, tropical paradise teeming with life. Our Rainforest Canopy habitat recreates the dense, humid environment of the world\'s great rainforests. Walk along elevated canopy walkways suspended 15 metres above the forest floor, peer through the mist at exotic birds flitting between branches, and listen to the chorus of tropical wildlife all around you. Home to over 50 species of birds, primates, and reptiles, this habitat offers an unforgettable journey through one of Earth\'s most biodiverse ecosystems.',
      image: 'https://static.vecteezy.com/system/resources/previews/070/719/340/large_2x/lush-green-tropical-rainforest-canopy-with-palm-trees-and-mist-in-southeast-asia-photo.jpeg',
      banner_image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&h=500&fit=crop',
      climate: 'Tropical',
      icon: '',
      featured: 1
    },
    {
      name: 'Savannah Plains',
      slug: 'savannah-plains',
      tagline: 'Witness the majesty of Africa\'s great plains',
      description: 'Step onto the golden grasslands where the horizon stretches endlessly before you. Our Savannah Plains habitat brings the awe-inspiring African savannah to life, home to some of the planet\'s most iconic wildlife. Watch giraffes gracefully stride across the plains, witness a pride of lions basking in the afternoon sun, and marvel at herds of zebra and wildebeest roaming freely. With over 20 acres of carefully managed open grassland, this habitat offers the most authentic safari experience outside of Africa.',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=400&fit=crop',
      banner_image: 'https://static.vecteezy.com/system/resources/previews/070/719/340/large_2x/lush-green-tropical-rainforest-canopy-with-palm-trees-and-mist-in-southeast-asia-photo.jpeg',
      climate: 'Arid',
      icon: '',
      featured: 1
    },
    {
      name: 'Arctic Frontier',
      slug: 'arctic-frontier',
      tagline: 'Explore the frozen wilderness of the far north',
      description: 'Enter a world of ice and wonder at our Arctic Frontier. This state-of-the-art cold climate habitat maintains sub-zero temperatures to provide the perfect home for our polar species. Watch penguins diving through crystal-clear pools, observe Arctic foxes in their stunning white winter coats, and come face-to-face with our magnificent polar bears through panoramic viewing windows. The habitat features an underwater observation tunnel where visitors can watch seals and penguins swimming gracefully beneath the ice.',
      image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=600&h=400&fit=crop',
      banner_image: 'https://images.unsplash.com/photo-1494564605686-2e931f77a8a2?w=1400&h=500&fit=crop',
      climate: 'Polar',
      icon: '',
      featured: 1
    },
    {
      name: 'Reptile Kingdom',
      slug: 'reptile-kingdom',
      tagline: 'Discover the ancient rulers of the natural world',
      description: 'Venture into the mysterious world of reptiles and amphibians at our Reptile Kingdom. This purpose-built facility houses over 100 species of snakes, lizards, crocodilians, and amphibians from every corner of the globe. Walk through climate-controlled biomes ranging from arid desert to humid swamp, and discover creatures that have existed virtually unchanged for millions of years. Our expert handlers offer daily talks and the chance to get up close with some of our friendlier residents.',
      image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd659e0?w=600&h=400&fit=crop',
      banner_image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd659e0?w=1400&h=500&fit=crop',
      climate: 'Mixed',
      icon: '',
      featured: 0
    },
    {
      name: 'Ocean Depths',
      slug: 'ocean-depths',
      tagline: 'Dive beneath the waves without getting wet',
      description: 'Descend into the mesmerising world beneath the ocean surface at our Ocean Depths aquarium. Walk through a 40-metre underwater tunnel as sharks, rays, and tropical fish glide silently overhead. Explore vibrant coral reef recreations bustling with colourful marine life, visit our jellyfish gallery with its hypnotic displays, and witness the raw power of our open ocean tank during feeding time. This habitat is home to over 5,000 marine animals representing 300 different species.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
      banner_image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1400&h=500&fit=crop',
      climate: 'Aquatic',
      icon: '',
      featured: 1
    }
  ];

  for (const h of habitats) {
    insertHabitat.run(h.name, h.slug, h.tagline, h.description, h.image, h.banner_image, h.climate, h.icon, h.featured);
  }

  // ──────────────────────────────────────────────
  // EXHIBITS / EXPERIENCES
  // ──────────────────────────────────────────────
  const insertExhibit = db.prepare(`
    INSERT INTO exhibits (habitat_id, name, slug, description, type, image, duration, difficulty, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const exhibits = [
    // Rainforest Canopy (habitat_id: 1)
    { habitat_id: 1, name: 'Canopy Walkway Adventure', slug: 'canopy-walkway-adventure', description: 'Traverse our suspended bridges and platforms 15 metres above the rainforest floor. Experience the jungle from the perspective of the creatures that live in the treetops, with panoramic views of the entire habitat.', type: 'adventure', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop', duration: '45 mins', difficulty: 'Moderate', featured: 1 },
    { habitat_id: 1, name: 'Tropical Bird Encounter', slug: 'tropical-bird-encounter', description: 'Step into our walk-through aviary where you can hand-feed parrots, toucans, and lorikeets. Our keepers will introduce you to these incredible birds and share fascinating facts about their behaviours and conservation.', type: 'encounter', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=400&fit=crop', duration: '30 mins', difficulty: 'Easy', featured: 1 },
    { habitat_id: 1, name: 'Rainforest Night Walk', slug: 'rainforest-night-walk', description: 'As darkness falls, the rainforest comes alive with a whole new cast of creatures. Join our expert guides on a torchlit walk through the habitat to discover nocturnal frogs, insects, and mammals you would never see during the day.', type: 'educational', image: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21c7f?w=600&h=400&fit=crop', duration: '60 mins', difficulty: 'Easy', featured: 0 },

    // Savannah Plains (habitat_id: 2)
    { habitat_id: 2, name: 'Safari Jeep Ride', slug: 'safari-jeep-ride', description: 'Climb aboard our open-top safari vehicles for a guided tour across the savannah. Get remarkably close to giraffes, zebras, and rhinos as our expert rangers share their knowledge about African wildlife and conservation efforts.', type: 'adventure', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop', duration: '50 mins', difficulty: 'Easy', featured: 1 },
    { habitat_id: 2, name: 'Giraffe Feeding Platform', slug: 'giraffe-feeding-platform', description: 'Stand eye-to-eye with our gentle giants on our elevated feeding platform. Hand-feed our family of giraffes and learn about their unique biology, social structures, and the challenges they face in the wild.', type: 'encounter', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=400&fit=crop', duration: '20 mins', difficulty: 'Easy', featured: 1 },
    { habitat_id: 2, name: 'Conservation Talk: Big Cats', slug: 'conservation-talk-big-cats', description: 'Join our head of big cats for an in-depth look at lion conservation. Learn about the threats facing wild lion populations, how breeding programmes work, and what WildHaven is doing to help protect these magnificent predators.', type: 'educational', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&h=400&fit=crop', duration: '30 mins', difficulty: 'Easy', featured: 0 },

    // Arctic Frontier (habitat_id: 3)
    { habitat_id: 3, name: 'Penguin Feeding Experience', slug: 'penguin-feeding-experience', description: 'Don your waterproofs and step into the penguin enclosure for a once-in-a-lifetime feeding experience. Help our keepers distribute fish to our colony of Gentoo and King penguins, and learn about life in the Antarctic.', type: 'encounter', image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=600&h=400&fit=crop', duration: '30 mins', difficulty: 'Easy', featured: 1 },
    { habitat_id: 3, name: 'Ice Cave Exploration', slug: 'ice-cave-exploration', description: 'Wrap up warm and venture into our recreated ice cave system. Marvel at stunning ice formations, learn about Arctic geology, and discover how animals have adapted to survive in one of the harshest environments on Earth.', type: 'adventure', image: 'https://images.unsplash.com/photo-1494564605686-2e931f77a8a2?w=600&h=400&fit=crop', duration: '40 mins', difficulty: 'Moderate', featured: 0 },
    { habitat_id: 3, name: 'Polar Bear Observation Deck', slug: 'polar-bear-observation', description: 'Visit our state-of-the-art observation deck featuring panoramic windows and an underwater viewing tunnel. Watch our polar bears swim, play, and hunt for enrichment items in their spacious Arctic environment.', type: 'educational', image: 'https://images.unsplash.com/photo-1517783999520-f068d7431d60?w=600&h=400&fit=crop', duration: '20 mins', difficulty: 'Easy', featured: 1 },

    // Reptile Kingdom (habitat_id: 4)
    { habitat_id: 4, name: 'Snake Handling Workshop', slug: 'snake-handling-workshop', description: 'Overcome your fears and get hands-on with some of our friendliest reptilian residents. Our expert handlers will guide you through holding pythons, corn snakes, and boas while teaching you about these misunderstood creatures.', type: 'encounter', image: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=600&h=400&fit=crop', duration: '30 mins', difficulty: 'Easy', featured: 1 },
    { habitat_id: 4, name: 'Crocodile Feeding Show', slug: 'crocodile-feeding-show', description: 'Watch from the safety of our elevated viewing gallery as our keepers feed our Nile crocodiles. Witness the incredible speed and power of these prehistoric predators and learn about crocodilian biology and behaviour.', type: 'educational', image: 'https://www.lavanillenaturepark.com/userimages/columnImage_257_1569218533.jpg', duration: '25 mins', difficulty: 'Easy', featured: 0 },
    { habitat_id: 4, name: 'Venomous Creatures Trail', slug: 'venomous-creatures-trail', description: 'Follow the trail through our secure venomous species exhibits. See cobras, vipers, poison dart frogs, and scorpions in naturalistic enclosures, while information panels explain the fascinating science of venom.', type: 'adventure', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&h=400&fit=crop', duration: '35 mins', difficulty: 'Easy', featured: 0 },

    // Ocean Depths (habitat_id: 5)
    { habitat_id: 5, name: 'Shark Tunnel Walk', slug: 'shark-tunnel-walk', description: 'Walk through our 40-metre transparent tunnel as blacktip reef sharks, nurse sharks, and giant rays glide silently above and around you. This immersive experience brings you closer to these majestic ocean predators than you ever imagined possible.', type: 'adventure', image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600&h=400&fit=crop', duration: '20 mins', difficulty: 'Easy', featured: 1 },
    { habitat_id: 5, name: 'Rockpool Touch Tank', slug: 'rockpool-touch-tank', description: 'Roll up your sleeves and explore our interactive rockpool zone. Gently handle starfish, sea urchins, hermit crabs, and anemones under the guidance of our marine biologists. A fantastic hands-on experience for all ages.', type: 'encounter', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop', duration: '25 mins', difficulty: 'Easy', featured: 0 },
    { habitat_id: 5, name: 'Coral Reef Conservation Lab', slug: 'coral-reef-conservation-lab', description: 'Visit our working marine conservation laboratory and discover how WildHaven is helping to restore coral reefs worldwide. See coral fragments growing in our nursery tanks and learn about the vital importance of reef ecosystems.', type: 'educational', image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&h=400&fit=crop', duration: '30 mins', difficulty: 'Easy', featured: 0 }
  ];

  for (const e of exhibits) {
    insertExhibit.run(e.habitat_id, e.name, e.slug, e.description, e.type, e.image, e.duration, e.difficulty, e.featured);
  }

  // ──────────────────────────────────────────────
  // ANIMALS
  // ──────────────────────────────────────────────
  const insertAnimal = db.prepare(`
    INSERT INTO animals (habitat_id, name, species, description, image, conservation_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const animals = [
    // Rainforest
    { habitat_id: 1, name: 'Scarlet Macaw', species: 'Ara macao', description: 'One of the most vibrantly coloured birds in the world, the Scarlet Macaw is a symbol of tropical rainforests. These intelligent parrots can live for over 75 years and mate for life.', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },
    { habitat_id: 1, name: 'Red-Eyed Tree Frog', species: 'Agalychnis callidryas', description: 'With their stunning red eyes and bright green bodies, these iconic frogs are the poster child of rainforest conservation. Their vivid colouring is used to startle predators.', image: 'https://images.unsplash.com/photo-1474314170901-f351b68f6f2f?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },
    { habitat_id: 1, name: 'Golden Lion Tamarin', species: 'Leontopithecus rosalia', description: 'These tiny primates with their magnificent golden manes are one of the most endangered species in the world. WildHaven is part of an international breeding programme to save them.', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&h=400&fit=crop', conservation_status: 'Endangered' },

    // Savannah
    { habitat_id: 2, name: 'African Lion', species: 'Panthera leo', description: 'The king of the savannah, our pride of African lions is one of WildHaven\'s most popular attractions. Watch them during our daily feeding demonstrations.', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=400&fit=crop', conservation_status: 'Vulnerable' },
    { habitat_id: 2, name: 'Rothschild Giraffe', species: 'Giraffa camelopardalis rothschildi', description: 'One of the most endangered giraffe subspecies, the Rothschild\'s giraffe is distinguished by its cream-coloured legs. Our family of five can be fed from our elevated platform.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=400&fit=crop', conservation_status: 'Near Threatened' },
    { habitat_id: 2, name: 'Plains Zebra', species: 'Equus quagga', description: 'No two zebras have the same stripe pattern. Our herd of plains zebras roam freely across our savannah alongside the giraffes and wildebeest.', image: 'https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?w=400&h=400&fit=crop', conservation_status: 'Near Threatened' },

    // Arctic
    { habitat_id: 3, name: 'King Penguin', species: 'Aptenodytes patagonicus', description: 'The second-largest penguin species, our King penguins are always a crowd favourite. Watch them waddle, swim, and socialise in our sub-zero habitat.', image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },
    { habitat_id: 3, name: 'Polar Bear', species: 'Ursus maritimus', description: 'The largest land predator on Earth, our polar bears enjoy a spacious environment complete with ice pools, snow machines, and enrichment activities.', image: 'https://images.unsplash.com/photo-1517783999520-f068d7431d60?w=400&h=400&fit=crop', conservation_status: 'Vulnerable' },
    { habitat_id: 3, name: 'Arctic Fox', species: 'Vulpes lagopus', description: 'These beautiful foxes change colour with the seasons — white in winter, brown in summer. Observe them hunting for hidden food items in our tundra simulation.', image: 'https://images.unsplash.com/photo-1516728778615-2d590ea1855e?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },

    // Reptile
    { habitat_id: 4, name: 'Komodo Dragon', species: 'Varanus komodoensis', description: 'The world\'s largest living lizard, the Komodo dragon can grow up to 3 metres long. Our pair are among the few in Europe and are part of a vital conservation programme.', image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd659e0?w=400&h=400&fit=crop', conservation_status: 'Endangered' },
    { habitat_id: 4, name: 'Green Tree Python', species: 'Morelia viridis', description: 'These stunning emerald-green snakes are masters of camouflage in the rainforest canopy. Juveniles are born bright yellow or red before turning green as adults.', image: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },
    { habitat_id: 4, name: 'Nile Crocodile', species: 'Crocodylus niloticus', description: 'One of Africa\'s most formidable predators, our Nile crocodiles are the stars of our daily feeding show. These prehistoric reptiles have remained virtually unchanged for 200 million years.', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },

    // Ocean
    { habitat_id: 5, name: 'Blacktip Reef Shark', species: 'Carcharhinus melanopterus', description: 'Easily identified by the black tips on their fins, these graceful sharks patrol our main ocean tank. Despite their fearsome appearance, they are generally harmless to humans.', image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=400&h=400&fit=crop', conservation_status: 'Vulnerable' },
    { habitat_id: 5, name: 'Moon Jellyfish', species: 'Aurelia aurita', description: 'Our mesmerising jellyfish gallery features hundreds of moon jellyfish illuminated by colour-changing lights. Watch these ethereal creatures pulse gently through the water.', image: 'https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=400&h=400&fit=crop', conservation_status: 'Least Concern' },
    { habitat_id: 5, name: 'Giant Pacific Octopus', species: 'Enteroctopus dofleini', description: 'The most intelligent invertebrate on the planet, our Giant Pacific Octopus regularly solves puzzles set by our keepers. Watch enrichment sessions daily at 2pm.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop', conservation_status: 'Least Concern' }
  ];

  for (const a of animals) {
    insertAnimal.run(a.habitat_id, a.name, a.species, a.description, a.image, a.conservation_status);
  }

  // ──────────────────────────────────────────────
  // EVENTS (2024, 2025, 2026)
  // ──────────────────────────────────────────────
  const insertEvent = db.prepare(`
    INSERT INTO events (habitat_id, title, slug, description, long_description, category, image, date, time, location, year, is_past)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    // ── 2024 (past) ──
    { habitat_id: 1, title: 'Spring Rainforest Festival', slug: 'spring-rainforest-festival-2024', description: 'A celebration of tropical biodiversity with live music, craft workshops, and guided rainforest tours.', long_description: 'Our annual Spring Rainforest Festival was a spectacular celebration of tropical biodiversity. Visitors enjoyed live acoustic music echoing through the canopy, hands-on craft workshops where children created rainforest animal masks, and special behind-the-scenes guided tours led by our senior keepers. The festival also featured guest speakers from the World Wildlife Fund who shared insights into current rainforest conservation projects across South America and Southeast Asia. Food stalls served tropical-themed cuisine, and our gift shop offered exclusive festival merchandise with proceeds going directly to rainforest protection charities.', category: 'Seasonal', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop', date: '2024-03-15', time: '10:00 - 17:00', location: 'Rainforest Canopy Zone', year: 2024, is_past: 1 },
    { habitat_id: 2, title: 'Night Safari Experience', slug: 'night-safari-2024', description: 'Explore the savannah after dark with torchlit guided walks and nocturnal animal encounters.', long_description: 'The Night Safari Experience offered visitors a rare opportunity to explore our Savannah Plains after the sun went down. Armed with red-filtered torches to minimise disturbance to the animals, groups of up to 15 were led by our expert rangers on a two-hour walking safari. Highlights included watching our lions during their most active period, observing nocturnal behaviours of our meerkats and aardvarks, and a special stargazing session led by a local astronomy society. Hot chocolate and marshmallows were provided at our campfire station, where rangers shared stories of their experiences working with African wildlife in the field.', category: 'Night Safari', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop', date: '2024-06-20', time: '20:00 - 23:00', location: 'Savannah Plains', year: 2024, is_past: 1 },
    { habitat_id: null, title: 'World Wildlife Conservation Day', slug: 'conservation-day-2024', description: 'A day dedicated to conservation education with guest speakers, interactive workshops, and fundraising.', long_description: 'WildHaven hosted its annual World Wildlife Conservation Day with a packed programme of educational activities and fundraising events. The day featured keynote talks from leading conservationists, including Dr. Sarah Mitchell from the Jane Goodall Institute and Professor James Chen from Oxford\'s Wildlife Conservation Research Unit. Interactive workshops taught visitors about wildlife monitoring techniques, habitat restoration, and how everyday choices impact global biodiversity. All proceeds from the day — including a charity auction of animal-themed artwork — were donated to our partner conservation organisations working to protect endangered species worldwide.', category: 'Conservation', image: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=400&fit=crop', date: '2024-12-04', time: '09:00 - 18:00', location: 'Main Event Pavilion', year: 2024, is_past: 1 },
    { habitat_id: 3, title: 'Winter Wonderland at Arctic Frontier', slug: 'winter-wonderland-2024', description: 'Festive celebrations with ice sculptures, penguin parades, and seasonal treats.', long_description: 'Our Arctic Frontier was transformed into a magical Winter Wonderland for the festive season. The event featured stunning ice sculptures created by international artists, a daily penguin parade where our colony waddled along a specially created pathway past delighted visitors, and a cosy warming hut serving hot drinks and festive treats. Children enjoyed meeting our resident "Polar Bear Santa" and received a conservation-themed gift. The event also included craft sessions where families could make bird feeders and wildlife-friendly decorations to take home for their gardens.', category: 'Seasonal', image: 'https://images.unsplash.com/photo-1494564605686-2e931f77a8a2?w=600&h=400&fit=crop', date: '2024-12-14', time: '10:00 - 20:00', location: 'Arctic Frontier', year: 2024, is_past: 1 },
    { habitat_id: null, title: 'Junior Keeper Summer Camp', slug: 'junior-keeper-camp-2024', description: 'A week-long programme for children aged 8-14 to learn about animal care and conservation.', long_description: 'Our popular Junior Keeper Summer Camp ran for four weeks throughout August, giving children aged 8-14 a unique behind-the-scenes experience at WildHaven. Each week-long programme included hands-on animal care activities, habitat maintenance tasks, enrichment creation workshops, and educational sessions about conservation biology. Participants helped prepare animal diets, cleaned enclosures, and assisted keepers with health checks on some of our smaller residents. Every junior keeper received a certificate, a WildHaven t-shirt, and the unforgettable experience of helping to care for animals from around the world.', category: 'Family', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop', date: '2024-08-05', time: '09:00 - 16:00', location: 'Education Centre', year: 2024, is_past: 1 },

    // ── 2025 (past/current) ──
    { habitat_id: 5, title: 'Ocean Conservation Week', slug: 'ocean-conservation-week-2025', description: 'A week of marine-themed activities highlighting the importance of ocean conservation.', long_description: 'Ocean Conservation Week brought the critical issues facing our oceans into sharp focus. Throughout the week, visitors enjoyed special talks from marine biologists, interactive displays about plastic pollution and its impact on marine life, and behind-the-scenes tours of our coral reef conservation laboratory. Children participated in beach clean-up simulations and created artwork from recycled ocean plastic. Our aquarium team demonstrated coral fragmentation techniques and explained how WildHaven\'s captive breeding programmes are helping to restore reef ecosystems. The week concluded with a special evening event featuring an underwater photography exhibition.', category: 'Conservation', image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&h=400&fit=crop', date: '2025-02-10', time: '09:00 - 18:00', location: 'Ocean Depths', year: 2025, is_past: 1 },
    { habitat_id: 2, title: 'Sunset Safari Evenings', slug: 'sunset-safari-2025', description: 'Extended opening hours with guided sunset walks across the savannah and sundowner drinks.', long_description: 'Throughout the summer months, WildHaven offered exclusive Sunset Safari Evenings every Friday and Saturday. Visitors enjoyed extended access to the Savannah Plains as the golden hour light created perfect conditions for photography and wildlife watching. Expert rangers led small groups on guided walking tours, sharing stories about each animal and pointing out behaviours rarely seen during regular opening hours. The evening included a complimentary sundowner drink at our Acacia Lounge, overlooking the plains as the sun set. These intimate events were limited to 50 visitors per evening to ensure a premium, uncrowded experience.', category: 'Night Safari', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=400&fit=crop', date: '2025-04-18', time: '18:00 - 21:30', location: 'Savannah Plains', year: 2025, is_past: 1 },
    { habitat_id: null, title: 'Easter Wildlife Egg Hunt', slug: 'easter-egg-hunt-2025', description: 'Family fun with an animal-themed Easter egg hunt across all habitats.', long_description: 'Our Easter Wildlife Egg Hunt was a roaring success, with over 3,000 families taking part across the long weekend. Children followed clue trails through each habitat, solving animal-themed puzzles to find hidden eggs. Each habitat featured its own special Easter activity: face painting in the Rainforest, a baby animal nursery viewing in the Savannah, egg decorating in the Arctic zone, a reptile handling session in the Reptile Kingdom, and rockpool exploration in Ocean Depths. Every child who completed the full trail received a WildHaven chocolate egg and a wildlife activity pack. The event also featured a visit from the Easter Bunny — or as we called them, the Easter Bilby, to raise awareness of this endangered Australian marsupial.', category: 'Family', image: 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=600&h=400&fit=crop', date: '2025-04-19', time: '09:00 - 17:00', location: 'All Habitats', year: 2025, is_past: 1 },
    { habitat_id: 4, title: 'Reptile Awareness Fortnight', slug: 'reptile-awareness-2025', description: 'Two weeks of special talks, handling sessions, and educational exhibits celebrating reptiles.', long_description: 'Reptile Awareness Fortnight aimed to change perceptions about some of the most misunderstood animals on the planet. The programme featured daily expert talks covering topics from venom science to reptile intelligence, extended handling sessions with our friendliest species, and a temporary exhibition showcasing stunning reptile photography from National Geographic photographers. Visitors could meet our newest arrivals — a pair of critically endangered Galapagos land iguanas — and learn about the international conservation effort to save their species. The fortnight culminated in a special Reptile Champions awards ceremony recognising outstanding contributions to reptile conservation worldwide.', category: 'Educational', image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd659e0?w=600&h=400&fit=crop', date: '2025-05-12', time: '09:00 - 18:00', location: 'Reptile Kingdom', year: 2025, is_past: 1 },
    { habitat_id: null, title: 'Summer Wildlife Photography Workshop', slug: 'photography-workshop-2025', description: 'Learn wildlife photography techniques with professional photographers in a stunning natural setting.', long_description: 'Our Summer Wildlife Photography Workshop series brought together amateur photographers and wildlife professionals for an extraordinary learning experience. Led by award-winning nature photographer Emma Richards, the workshops covered composition, lighting, animal behaviour anticipation, and post-processing techniques. Participants had exclusive early-morning and late-evening access to the park when the animals are most active and the light is at its most dramatic. Each workshop was limited to 12 participants to ensure personalised instruction. Attendees left with a portfolio of professional-quality wildlife images and the skills to continue capturing stunning nature photography independently.', category: 'Educational', image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=400&fit=crop', date: '2025-07-05', time: '06:00 - 11:00', location: 'Various Habitats', year: 2025, is_past: 1 },
    { habitat_id: 1, title: 'Tropical Nights Music Festival', slug: 'tropical-nights-2025', description: 'Live music performances in the rainforest with food stalls and evening animal encounters.', long_description: 'Tropical Nights transformed our Rainforest Canopy zone into an enchanting open-air music venue for three magical evenings. Local and regional musicians performed acoustic sets beneath the canopy as the sounds of the jungle provided a natural backdrop. Food stalls from local restaurants served tropical-inspired dishes, and our bar offered exotic cocktails and mocktails. Between sets, keepers led small groups on special evening encounters with our nocturnal rainforest residents. The festival atmosphere combined the magic of live music with the wonder of wildlife, creating an event unlike any other in the region.', category: 'Seasonal', image: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21c7f?w=600&h=400&fit=crop', date: '2025-08-15', time: '18:00 - 23:00', location: 'Rainforest Canopy Zone', year: 2025, is_past: 1 },

    // ── 2026 (upcoming) ──
    { habitat_id: null, title: 'New Year Wildlife Walk', slug: 'new-year-walk-2026', description: 'Start the year with a peaceful guided walk through all five habitats and refreshments.', long_description: 'Begin 2026 with a tranquil and inspiring guided walk through all five of WildHaven\'s habitats. Our expert guides will lead small groups on a leisurely two-hour tour, sharing fascinating New Year traditions involving animals from cultures around the world. The walk includes exclusive access to behind-the-scenes areas and a chance to see how our keepers start their day. Afterwards, enjoy complimentary hot drinks and pastries in our Treetop Cafe while watching the rainforest come alive below. A perfect way to start the year surrounded by nature and wildlife.', category: 'Seasonal', image: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=400&fit=crop', date: '2026-01-02', time: '10:00 - 13:00', location: 'All Habitats', year: 2026, is_past: 1 },
    { habitat_id: 5, title: 'Deep Sea Discovery Day', slug: 'deep-sea-discovery-2026', description: 'A special event exploring the mysteries of the deep ocean with interactive exhibits and talks.', long_description: 'Deep Sea Discovery Day will take visitors on a journey to the most unexplored frontier on our planet — the deep ocean. The event features interactive exhibits about deep-sea creatures, bioluminescence demonstrations in our darkened gallery, and talks from marine scientists who have participated in deep-sea research expeditions. Children can pilot a virtual submarine through a simulated deep-sea environment and discover bizarre creatures that live in complete darkness. Our Ocean Depths team will also unveil our newest exhibit — a recreation of a deep-sea hydrothermal vent ecosystem — and explain how life thrives in these extreme conditions.', category: 'Educational', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop', date: '2026-03-22', time: '09:00 - 18:00', location: 'Ocean Depths', year: 2026, is_past: 1 },
    { habitat_id: null, title: 'Earth Day Conservation Summit', slug: 'earth-day-summit-2026', description: 'A full-day summit featuring conservationists, workshops, and pledges for a greener future.', long_description: 'WildHaven\'s Earth Day Conservation Summit will bring together leading voices in wildlife conservation for a day of inspiration and action. The summit features keynote presentations from renowned conservationists, panel discussions on pressing environmental issues, and interactive workshops where visitors can learn practical ways to reduce their environmental impact. Activities include tree planting sessions, wildlife-friendly gardening workshops, and a conservation marketplace showcasing eco-friendly products from local businesses. The day culminates in a communal pledge ceremony where visitors commit to specific conservation actions for the coming year.', category: 'Conservation', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop', date: '2026-04-22', time: '09:00 - 19:00', location: 'Main Event Pavilion', year: 2026, is_past: 1 },
    { habitat_id: 2, title: 'Safari Under the Stars', slug: 'safari-under-stars-2026', description: 'An overnight safari experience with camping, night walks, and dawn wildlife viewing.', long_description: 'Safari Under the Stars is WildHaven\'s most immersive event — an unforgettable overnight experience on the Savannah Plains. Guests will set up camp in luxury safari tents overlooking the grasslands, enjoy a gourmet barbecue dinner under the open sky, and participate in guided night walks with our rangers using specialist thermal imaging equipment. As dawn breaks, wake to the sounds of the savannah and enjoy an exclusive sunrise viewing session as the animals begin their day. The experience includes all meals, refreshments, and a commemorative photograph. Limited to just 20 guests per night for an intimate and exclusive adventure.', category: 'Night Safari', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop', date: '2026-06-15', time: '17:00 - 09:00', location: 'Savannah Plains', year: 2026, is_past: 0 },
    { habitat_id: null, title: 'Summer Family Fun Week', slug: 'summer-fun-week-2026', description: 'A week of family activities including crafts, games, animal encounters, and treasure hunts.', long_description: 'Summer Family Fun Week is WildHaven\'s biggest family event of the year, with activities designed for children of all ages. Each day has a different theme — Monday is Rainforest Rangers, Tuesday is Savannah Explorers, Wednesday is Arctic Adventurers, Thursday is Reptile Researchers, and Friday is Ocean Investigators. Activities include wildlife-themed craft workshops, interactive storytelling sessions, face painting, treasure hunts, and special close-encounter animal sessions. There will also be outdoor games, a bouncy castle safari, and live entertainment throughout the week. The week concludes with a grand finale parade featuring all of WildHaven\'s mascot characters.', category: 'Family', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop', date: '2026-07-20', time: '09:00 - 18:00', location: 'All Habitats', year: 2026, is_past: 0 },
    { habitat_id: 3, title: 'Polar Expedition Week', slug: 'polar-expedition-2026', description: 'Special Arctic-themed activities with guest polar researchers and exclusive penguin encounters.', long_description: 'Polar Expedition Week brings the adventure of Arctic and Antarctic exploration to WildHaven. Guest polar researchers who have spent months on research stations at the Earth\'s poles will share their extraordinary experiences through talks and interactive presentations. Visitors can try on genuine polar expedition gear, test their survival skills in our simulated blizzard chamber, and enjoy exclusive small-group penguin encounters where they can help our keepers with feeding and health checks. The week also features a temporary exhibition of polar photography, ice sculpture demonstrations, and a special screening of award-winning polar wildlife documentaries in our cinema room.', category: 'Educational', image: 'https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=600&h=400&fit=crop', date: '2026-09-01', time: '09:00 - 18:00', location: 'Arctic Frontier', year: 2026, is_past: 0 },
    { habitat_id: null, title: 'Autumn Harvest Wildlife Fair', slug: 'autumn-harvest-fair-2026', description: 'Celebrate autumn with seasonal food, nature walks, and wildlife-friendly gardening workshops.', long_description: 'The Autumn Harvest Wildlife Fair celebrates the changing seasons with a programme of activities that connect visitors with nature. Browse stalls selling locally produced autumn produce, attend wildlife-friendly gardening workshops to learn how to prepare your garden for hedgehogs, birds, and insects over winter, and join guided nature walks through our grounds to spot autumn wildlife and learn about seasonal animal behaviours. Children can enjoy apple pressing demonstrations, pumpkin carving, and conker championships. The fair also features a farmers\' market, live folk music, and warming seasonal food and drinks in our specially decorated event marquee.', category: 'Seasonal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', date: '2026-10-10', time: '10:00 - 17:00', location: 'Main Event Pavilion', year: 2026, is_past: 0 },
    { habitat_id: null, title: 'Endangered Species Gala', slug: 'endangered-species-gala-2026', description: 'An evening fundraising gala with dinner, auctions, and exclusive after-hours animal encounters.', long_description: 'The Endangered Species Gala is WildHaven\'s premier fundraising event, bringing together wildlife enthusiasts, conservationists, and philanthropists for an elegant evening dedicated to saving the world\'s most threatened species. The black-tie event includes a champagne reception in our Rainforest Canopy zone, a three-course dinner prepared by a Michelin-starred chef, and a charity auction featuring once-in-a-lifetime wildlife experiences. Guests will enjoy exclusive after-hours encounters with our most endangered residents, including our Komodo dragons and Golden Lion Tamarins. All proceeds from the evening will fund WildHaven\'s international conservation partnerships across five continents.', category: 'Conservation', image: 'https://images.unsplash.com/photo-1474314170901-f351b68f6f2f?w=600&h=400&fit=crop', date: '2026-11-15', time: '18:30 - 23:00', location: 'Main Event Pavilion', year: 2026, is_past: 0 },
    { habitat_id: null, title: 'WildHaven Christmas Spectacular', slug: 'christmas-spectacular-2026', description: 'Festive fun with Santa\'s Grotto, winter markets, light trails, and animal-themed gifts.', long_description: 'WildHaven\'s Christmas Spectacular transforms the entire park into a festive wonderland. Follow our enchanting light trail through illuminated habitats, visit Santa\'s Wildlife Grotto where children receive a conservation-themed gift, and browse our Christmas market for unique wildlife-themed presents and locally made crafts. Our Arctic Frontier hosts a special daily penguin parade with a festive twist, while the Rainforest Canopy zone features carol singing beneath the tropical trees. Warm up with mulled wine and mince pies at our Winter Lodge, enjoy fairground rides, and take home memories that will last a lifetime. Special late-night openings every Friday and Saturday throughout December.', category: 'Seasonal', image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&h=400&fit=crop', date: '2026-12-01', time: '10:00 - 21:00', location: 'All Habitats', year: 2026, is_past: 0 }
  ];

  for (const ev of events) {
    insertEvent.run(ev.habitat_id, ev.title, ev.slug, ev.description, ev.long_description, ev.category, ev.image, ev.date, ev.time, ev.location, ev.year, ev.is_past);
  }

  // ──────────────────────────────────────────────
  // FAQS
  // ──────────────────────────────────────────────
  const insertFaq = db.prepare(`
    INSERT INTO faqs (question, answer, category, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  const faqs = [
    { question: 'What are the opening times?', answer: 'WildHaven Adventure Park is open every day of the year from 9:00am to 6:00pm, with last entry at 5:00pm. During special events, extended opening hours may apply — check our Events page for details.', category: 'General', sort_order: 1 },
    { question: 'Is there free parking available?', answer: 'Yes, we offer free parking for all visitors. Our main car park accommodates over 1,000 vehicles, including designated accessible parking spaces close to the main entrance. Overflow parking is available during peak periods with a complimentary shuttle service to the gate.', category: 'General', sort_order: 2 },
    { question: 'Are there food and drink facilities?', answer: 'Absolutely! WildHaven has five dining options: the Treetop Cafe (hot meals and snacks), the Savannah Grill (barbecue and burgers), the Polar Bites Kiosk (ice cream and cold drinks), the Reef Restaurant (seafood and family dining), and the Jungle Juice Bar (smoothies and fresh juices). Picnic areas are also available throughout the park.', category: 'General', sort_order: 3 },
    { question: 'Is the park wheelchair accessible?', answer: 'Yes, WildHaven is committed to being fully accessible to all visitors. All pathways are wheelchair-friendly, and accessible viewing points are available at every habitat. Wheelchair hire is available free of charge from our Visitor Services desk. Accessible toilets are located throughout the park, and our restaurants all offer step-free access. Please contact us in advance if you have specific accessibility requirements and we will do our best to accommodate them.', category: 'Accessibility', sort_order: 4 },
    { question: 'Can I bring my dog to the park?', answer: 'For the safety and wellbeing of our animals, only registered assistance dogs are permitted within WildHaven. However, we do have a free, secure dog-sitting service at our Welcome Centre where your pet will be looked after by trained staff while you enjoy your visit.', category: 'General', sort_order: 5 },
    { question: 'Are there facilities for children under 5?', answer: 'Yes! We have baby changing facilities in all toilet blocks, a nursing room at the Visitor Centre, highchairs in all restaurants, and buggy-friendly paths throughout the park. Buggy hire is available at a small charge from the main entrance. Our Rainforest Soft Play area is perfect for toddlers.', category: 'Accessibility', sort_order: 6 },
    { question: 'What should I do in case of an emergency?', answer: 'WildHaven has trained first aiders on duty at all times. In case of a medical emergency, contact any member of staff or go to our First Aid station located next to the Visitor Centre. For other emergencies, follow instructions from park staff. Emergency assembly points are clearly signposted throughout the park.', category: 'Safety', sort_order: 7 },
    { question: 'Can I feed the animals?', answer: 'For the health and safety of our animals, visitors should not feed any animals unless participating in an official feeding experience. We offer supervised feeding experiences at several habitats including the Giraffe Feeding Platform, Penguin Feeding Experience, and Tropical Bird Encounter. These can be joined on a first-come, first-served basis.', category: 'Safety', sort_order: 8 },
    { question: 'Is there a gift shop?', answer: 'Our main WildHaven Gift Shop at the park entrance stocks a wide range of wildlife-themed merchandise, including cuddly toys, books, clothing, and souvenirs. Each habitat also has its own smaller gift kiosk with themed items. Many of our products are sustainably sourced and eco-friendly, and a portion of all sales supports our conservation programmes.', category: 'General', sort_order: 9 },
    { question: 'How do I get to WildHaven Adventure Park?', answer: 'WildHaven is located just off the M27, Junction 5. Follow the brown tourist signs from the motorway. We are also accessible by public transport — bus route 42 runs directly to the park entrance from the city centre every 30 minutes. Cycle racks are available at the main entrance for those arriving by bicycle.', category: 'General', sort_order: 10 },
    { question: 'Do you offer group or school visits?', answer: 'Yes, we welcome group visits and offer specially tailored educational programmes for schools. Our education team can design age-appropriate sessions linked to the national curriculum, covering topics such as habitats, adaptation, food chains, and conservation. Group discounts are available — please contact our bookings team via the Contact page for more information.', category: 'General', sort_order: 11 },
    { question: 'What happens if it rains?', answer: 'WildHaven is an all-weather attraction! Many of our habitats are fully or partially covered, including the Rainforest Canopy, Reptile Kingdom, and Ocean Depths. Our restaurants, cafes, and gift shops provide additional shelter. We recommend bringing waterproof clothing for the outdoor habitats, as the animals are often more active in the rain!', category: 'General', sort_order: 12 }
  ];

  for (const f of faqs) {
    insertFaq.run(f.question, f.answer, f.category, f.sort_order);
  }

  console.log('✅ Database seeded successfully with sample data.');
}

// Allow running as standalone script
const isMainModule = process.argv[1] && (
  process.argv[1].includes('seed.mjs')
);

if (isMainModule) {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  initDatabase(rootDir);
  console.log('Database initialised at database/wildlife.db');
}
