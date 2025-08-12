// db.js
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = process.env.DB_DIR || path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'boards.db');
const SEED = require('./seed/boards.json'); // <-- move your JSON here

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) return console.error('SQLite open error:', err.message);
    console.log('Connected to SQLite:', DB_PATH);
});

function upsertAll() {
    const stmt = db.prepare(`
    INSERT INTO boards (name, url, category, description)
    VALUES (?,?,?,?)
    ON CONFLICT(name) DO UPDATE SET
      url = excluded.url,
      category = excluded.category,
      description = excluded.description
  `);

    SEED.forEach(b => stmt.run(b.name, b.url, b.category, b.description || null));
    stmt.finalize(() => console.log('Seed upsert complete.'));
}

db.serialize(() => {
    // Base table (original schema)
    db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      url TEXT,
      category TEXT
    )
  `);

    // Migrate: add "description" column if it doesn't exist
    db.get(
        `SELECT 1 AS ok FROM pragma_table_info('boards') WHERE name='description'`,
        (err, row) => {
            if (err) {
                console.error('PRAGMA check failed:', err.message);
                return;
            }
            if (!row) {
                db.run(`ALTER TABLE boards ADD COLUMN description TEXT`, (e) => {
                    if (e && !/duplicate column/i.test(e.message)) {
                        console.error('ALTER failed:', e.message);
                    }
                    upsertAll(); // after adding column
                });
            } else {
                upsertAll(); // column already present
            }
        }
    );
});

module.exports = db;
