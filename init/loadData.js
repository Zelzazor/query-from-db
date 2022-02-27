const fs = require('fs');
const path = require('path');

let rawdata = fs.readFileSync(path.resolve('info.json'));
let data = JSON.parse(rawdata);


module.exports = data;