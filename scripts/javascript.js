
var fs = require('fs');
var browserify = require('browserify');
var less = require('less');

var b = browserify('src/components/index.js');


function directoryExists(s) {
  try {
    fs.statSync(s);
    return true;
  } catch(err) {
    return false;
  }
}

console.log("Creating query file");
require('./concatqueries');


/*
b.transform({
    global: true
}, 'uglifyify');
*/
console.log("Creating directories");
// Make js first
if (!directoryExists("js")) {
  fs.mkdirSync("js");
}

console.log("Bundling JavaScript");
b.bundle((err, buffer) => {
  if (err) throw err;
  fs.writeFile('js/bundle.js', buffer, (err, fd) => {
    if (err) throw err;
  }); 
});

