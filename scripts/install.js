
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

if(!directoryExists("css")) {
  fs.mkdirSync("css");
}

console.log("Bundling JavaScript");
b.bundle((err, buffer) => {
  if (err) throw err;
  fs.writeFile('js/bundle.js', buffer, (err, fd) => {
    if (err) throw err;
  }); 
});

console.log("Compiling less");
fs.readFile('src/less/custom.less', 'utf8', (err, data) => {
  if (err) throw err;
  less.render(data,
    {
//      compress: true
    },
    (err, output) => {
      if (err) throw err;
      fs.writeFile('css/custom.css', output.css, (err, fs) => {
        if (err) throw err;
      });
  });
  
});
