const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db/database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
    });

module.exports = db;