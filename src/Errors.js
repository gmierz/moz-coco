
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var Errors = {
  fatal: "fatal",
  error: "error",
  warn: "warn",
  info: "info",
  callback: function(level, message) {
    console.log(`${level}: ${message}`); 
  },
  handleError: function(level, message) {
    var perr = "During a previous error a programmer error"
        + " occurred while processing the previous error";
    if (!this.callback) {
      console.log(`${level}: ${message}`); 
      console.log(perr);
      return;
    }
    if (!this.hasOwnProperty(level) || !(typeof this[level] === 'string')) {
      this.callback(this.warn, message);
      this.callback(this.warn, perr);
      return;
    }
    this.callback(level, message);
  }
}

module.exports = Errors;
