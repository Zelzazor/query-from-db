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
    console.log('Table articulos created successfully.');

});

// tblMigrantes
// id
// TipoDocumento
// Documento
// Nombres
// Apellidos
// EstadoCivil
// Sexo
// FechaNacimiento
// FechaIngeso
// TipoDocumentoMadre
// DocumentoMadre
// Estado
// Foto
db.run('CREATE TABLE IF NOT EXISTS tblMigrantes (id INTEGER PRIMARY KEY, TipoDocumento TEXT, Documento TEXT, Nombres TEXT, Apellidos TEXT, EstadoCivil TEXT, Sexo TEXT, FechaNacimiento DATE, FechaIngreso DATETIME DEFAULT now, TipoDocumentoMadre TEXT, DocumentoMadre TEXT, Estado TEXT, Foto TEXT)',(err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Table tblMigrantes created successfully.');

});


// db.run('DROP TABLE tblMigrantes', (err) => {
//     if (err) {
//         console.error(err.message);
//         return
//     }
//     console.log('Table tblMigrantes dropped successfully.');});


// tblMovimiento
// id
// TipoDocumeto
// Documento
// Entrada_Salida
// FechaIngreso
// Lugar
// País

db.run('CREATE TABLE IF NOT EXISTS tblMovimiento (id INTEGER PRIMARY KEY, TipoDocumento TEXT, Documento TEXT, Entrada_Salida TEXT, FechaIngreso DATETIME DEFAULT now, Lugar TEXT, Pais TEXT)',(err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Table tblMovimiento created successfully.');

})



db.close();