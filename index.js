const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/boards', (req, res) => {
    const { cetegory } = req.query;
    let sql = 'SELECT * FROM boards';
    const params = [];
    if (cetegory) {
        sql += ' WHERE cetegory = ?';
        params.push(cetegory);
    }
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Llamalyze API listening on http://localhost:${port}`));
