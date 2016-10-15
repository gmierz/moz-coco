var fs = require('fs');
var child_process = require('child_process');
var process = require('process');
function copyFile(source, dest) {
  fs.createReadStream(source).pipe(fs.createWriteStream(dest));
}

try {
  process.chdir('./src/bootstrap');
} catch (err) {
  console.log(`error ${err}`);
  return;
}

// Run grunt
var gruntrun = child_process.execFileSync('grunt', ['dist']);

const gruntdist = 'dist/css/';
const targetdir = '../../css/';

// Copy
copyFile(gruntdist + 'bootstrap.min.css', targetdir + 'bootstrap.min.css');
copyFile(gruntdist + 'bootstrap-theme.min.css', targetdir + 'bootstrap-theme.min.css');
