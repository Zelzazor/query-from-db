//NOTA: Como SQLite no soporta stored procedures, se emplearán prepared statements
require('dotenv').config()
const AWS = require('aws-sdk')
const fs = require('fs')

const {
    AWS_KEY_VALUE,
    AWS_SECRET_KEY_VALUE, 
    AWS_REGION_VALUE, 
} = process.env

// Necesitamos estas variables de AWS para poder acceder al servicio
if(!AWS_KEY_VALUE || !AWS_REGION_VALUE || !AWS_SECRET_KEY_VALUE)
    throw new Error('Missing aws enviroment vars')


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

});


app.get('/text',(req, res) => {
    res.render('text');
});

app.post('/text', upload.single('image'), async (req, res)=>{
    const { file } = req;
    fs.readFile(req.file.path, async (err, data) => {
        file.buffer = data;
        if(!file) return res.status(400).send()
    
        //Inicializamos la instancia de AWS Rekognition 
        const rekognition = new AWS.Rekognition({
            accessKeyId: AWS_KEY_VALUE,
            secretAccessKey: AWS_SECRET_KEY_VALUE,
            region: AWS_REGION_VALUE,
            apiVersion: '2016-06-27'
        });

        // Usando un FileStream para enviar a AWS
        const params = {
            Image: {
                Bytes: file.buffer
            },
            MinConfidence: 60
        }
    
        try {
            // Solicitamos el reconocimiento a AWS
        
            const response = await rekognition.detectModerationLabels(params).promise();
            const detections = response.ModerationLabels.map(detects=> detects.Name);


            const dateParts = req.body.FechaNacimiento.split('-');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const age = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24 * 365.25)); 
           

                if(detections.length == 0 && (req.body.Sexo !== 'Masculino' && age < 18)){
                    db.serialize(()=>{
                    let query = "";
                    let queryValues = [];
                    if(req.body.DocumentoMadre === "" || !req.body.DocumentoMadre){
                        query = 'INSERT INTO tblMigrantes (TipoDocumento, Documento, Nombres, Apellidos, EstadoCivil, Sexo, FechaNacimiento, FechaIngreso, Foto) VALUES (?,?,?,?,?,?,?,?,?)';
                        queryValues = [req.body.TipoDocumento, req.body.Documento, req.body.Nombres, req.body.Apellidos, req.body.EstadoCivil, req.body.Sexo, req.body.FechaNacimiento, req.body.FechaIngreso, req.file.path];
                    }
                    else{
                        query = 'INSERT INTO tblMigrantes (TipoDocumento, Documento, Nombres, Apellidos, EstadoCivil, Sexo, FechaNacimiento, FechaIngreso, TipoDocumentoMadre, DocumentoMadre, Foto) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
                        queryValues = [req.body.TipoDocumento, req.body.Documento, req.body.Nombres, req.body.Apellidos, req.body.EstadoCivil, req.body.Sexo, req.body.FechaNacimiento, req.body.FechaIngreso, req.body.TipoDocumentoMadre, req.body.DocumentoMadre, req.file.path];
                    }

                    let stmt = db.prepare(query);
                    stmt.run(...queryValues);
                    stmt.finalize();
                    stmt = db.prepare('INSERT INTO tblMovimiento (TipoDocumento, Documento, Entrada_Salida, FechaIngreso, Lugar, Pais) VALUES (?,?,?,?,?,?)');
                    stmt.run(req.body.TipoDocumento, req.body.Documento, req.body.Entrada_Salida, req.body.FechaIngreso, req.body.Lugar, req.body.Pais);
                    stmt.finalize();
                    });
                    return res.render('success-migrant');
                }
                else{
                    if(detections.length > 0){
                        return res.render('detections', {data: detections});
                    }
                    else{
                        console.log(age);
                        console.log(req.body.Sexo);
                        return res.render('invalid-migrant');
                    }
                }
        
                 
        } catch (error) {
            console.error(error)
            return res.status(500).send({ error })
        }
        })
    
    

});

app.get('/migrants', (req, res) => {
    db.serialize(()=>{
        let stmt = db.prepare('SELECT * FROM tblMigrantes');
        stmt.run();
        stmt.all((err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            return res.render('migrants', {data: rows});
        });
        stmt.finalize();
        
    });

})

app.get('/moves', (req, res) => {
    db.serialize(()=>{
        let stmt = db.prepare('SELECT * FROM tblMovimiento');
        stmt.run();
        stmt.all((err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }
            return res.render('moves', {data: rows});
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
