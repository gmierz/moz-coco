var fs = require('fs');
var less = require('less');

function directoryExists(s) {
  try {
    fs.statSync(s);
    return true;
  } catch(err) {
    return false;
  }
}

if(!directoryExists("css")) {
  fs.mkdirSync("css");
}

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
