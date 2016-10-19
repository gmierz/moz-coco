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

console.log("Running npm install");
// Run grunt
var npmrun = child_process.execFileSync('npm', ['install']);
console.log("Running grunt dist");
var gruntrun = child_process.execFileSync('grunt', ['dist']);

const gruntdist = 'dist/css/';
const targetdir = '../../css/';

console.log("Copying bootstrap compiled css");
// Copy
copyFile(gruntdist + 'bootstrap.min.css', targetdir + 'bootstrap.min.css');
copyFile(gruntdist + 'bootstrap-theme.min.css', targetdir + 'bootstrap-theme.min.css');
