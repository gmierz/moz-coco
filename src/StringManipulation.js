
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

function headlineCase(str) {
  var words = str.split(' ')
  words = words.map(word => {
    return word.substring(0, 1).toUpperCase() + word.substring(1);
  });
  return words.join(' ');
}

function expandConnectors(str) {
  return str.replace(/\-/g, ' ').replace(/\./g, ' ')
            .replace(/\_/g, ' ').replace(/\ {1,}/g, ' ');
}

function header(str) {
  return headlineCase(expandConnectors(str));
}

module.exports = {headlineCase, expandConnectors, header};
