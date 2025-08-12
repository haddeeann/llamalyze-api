// db.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const boardsData = require('./data/boards.json');

const DBSOURCE = path.join(__dirname, 'data', 'boards.db');
const db = new sqlite3.Database(DBSOURCE, err => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite database.');

    db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      url TEXT,
      category TEXT
    )
  `, () => {
        // seed if empty
        db.get(`SELECT COUNT(*) AS cnt FROM boards`, (e, row) => {
            if (row.cnt === 0) {
                const insert = db.prepare(`INSERT INTO boards (name,url,category) VALUES (?,?,?)`);
                boardsData.forEach(b => insert.run(b.name,b.url,b.category));
                insert.finalize(() => console.log('Seeded boards table.'));
            }
        });
    });
});

module.exports = db;
