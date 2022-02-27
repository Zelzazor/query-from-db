const sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dir = './uploads/';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    console.log("Directory " + dir + " created");
}

let db = new sqlite3.Database('./db/database.db');


db.run('CREATE TABLE IF NOT EXISTS articulos (id INTEGER PRIMARY KEY, title TEXT, description TEXT, imageUrl TEXT, price FLOAT)', 
(err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Table created successfully.');

});


db.close();