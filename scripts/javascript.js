
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

function editFile(file, findandreplace) {
  var filecopy = fs.readFileSync(file, encoding="utf8");
  for (var i in findandreplace) {
    var k = findandreplace[i][0];
    var v = findandreplace[i][1];
    filecopy = filecopy.replace(k, v);
  }
  fs.writeFileSync(file, filecopy);
}

var production = false;
if (process.argv[2] === 'production') {
  console.log("Using production mode");
  production = true;
}

console.log("Writing config file");
editFile('src/Config.js', [
  [/const DEVON = (true|false)/, 'const DEVON = ' + String(!production)]
]);

if (production) {
  b.transform({
      global: true
  }, 'uglifyify');
}

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

