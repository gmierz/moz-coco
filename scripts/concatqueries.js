
const fs = require("fs");
const randomstring = require("randomstring");
function getQueries() {
  const templatefile = "./src/client/ClientConstants.js.tmpl";
  var template = fs.readFileSync(templatefile, encoding="utf8"); 

  var querydata = "";
  const jsreg = /(.*)\.js$/;
  const exportsreg = /module\.exports\s*=\s*\{\s*(\S*)\s*\}\s*;/
  const allQueriesreg = /allQueries/g;

  const path = "./src/queries";
  var files = fs.readdirSync(path);
  var datafile;
  // Get our queries and change the module.exports line
  for (var file in files) {
    file = files[file]
    var match = jsreg.exec(file);
    if (match) {
      console.log(`Adding query file ${file}`);
      datafile = fs.readFileSync(`${path}/${file}`, encoding="utf8");
      datafile = datafile.replace(allQueriesreg, "randomVar_" + randomstring.generate(10));
      datafile = datafile.replace(exportsreg, "__allQueries = __allQueries.concat($1);");
      querydata += "\n" + datafile;
    }
  }
  // Now add it back into template
  const queriesmarkreg = /\/\/\$QUERIES\$/; // Match sticks?
  return template.replace(queriesmarkreg, querydata);
}

const outputfile = "./src/client/ClientConstants.js";
fs.writeFileSync(outputfile, getQueries());
console.log(`Writing to ${outputfile}`);

module.exports = {};
