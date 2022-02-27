//NOTA: Como SQLite no soporta stored procedures, se emplearán prepared statements

const express = require('express');
const db = require('./init/initDB');
const app = express();
const data = require('./init/loadData');
const upload = require('./init/initFileUpload');


app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    db.serialize(()=>{
        let stmt = db.prepare('SELECT * FROM articulos');
        stmt.run();
        stmt.all((err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            return res.render('index', {data: rows});
        });
        stmt.finalize();
        
    });

})

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
    });
    
    res.redirect('/success');
})

app.get('/success', (req, res) => {
    res.render('success');
})

app.get('/search', (req, res) => {
    let query = req.query.q;
    if(query && query.length > 0){
        db.serialize(()=>{
            let stmt = db.prepare('SELECT * FROM articulos WHERE title LIKE ? OR description LIKE ?');
            stmt.run("%"+query+"%", "%"+query+"%");
            stmt.all((err, rows) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                return res.render('search', {data: rows});
            });
        stmt.finalize();
        
        });
    }
    else{
        res.redirect('/');
    }
    //console.log(results)
    
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
