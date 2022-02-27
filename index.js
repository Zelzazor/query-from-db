//NOTA: Como SQLite no soporta stored procedures, se emplearán prepared statements

const express = require('express');
const db = require('./init/initDB');
const app = express();
const data = require('./init/loadData');
const upload = require('./init/initFileUpload');


app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'pug');

app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', upload.single('image'),(req, res) => {
    db.serialize(()=>{
        let stmt = db.prepare('INSERT INTO articulos (title, description, imageUrl, price) VALUES (?,?,?,?)');
        stmt.run(req.body.title, req.body.description, req.file.path, req.body.price, (err) => {
            if (err) {
                console.error(err.message)
                return;
            }
            console.log("Added successfully");
        });
        stmt.finalize();
        stmt = db.prepare('SELECT * FROM articulos');
        stmt.each((err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log(row);
        }, 
        (err,count) => {
            stmt.finalize();
        });

    });
    
    res.redirect('/success');
})

app.get('/success', (req, res) => {
    res.render('success');
})

app.get('/search', (req, res) => {
    let query = req.query.q;
    let result = data.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase()));
    res.render('search', {data: result});
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
