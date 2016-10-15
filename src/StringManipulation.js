
function headlineCase(str) {
  words = str.split(' ')
  words = words.map(word => {
    return word.substring(0, 1).toUpperCase() + word.substring(1);
  });
  return words.join(' ');
}

function expandConnectors(str) {
  return str.replace(/\-/g, ' ').replace(/\_/g, ' ').replace(/\ {1,}/g, ' ');
}

function header(str) {
  return headlineCase(expandConnectors(str));
}

module.exports = {headlineCase, expandConnectors, header};
