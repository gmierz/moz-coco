
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var https = require('https');
var Errors = require('../Errors');
/* 
 * This client simplifies communication with ActiveData
 */

var handleErrors = function(err) {
  Errors.handleError(Errors.error, "Exception in Client.js: " + err);
  throw err;
}

function makeRequest(host, body, callback) {
  Errors.handleError(Errors.info, "Query sent: " + 
      JSON.stringify(body));
  var jsonbody = JSON.stringify(body);
  var options = {
    hostname: host,
    port: 443,
    path: '/query',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(jsonbody)
    }
  }
  var respchunks = [];
  var p = new Promise((resolve, reject) => {
    var req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        respchunks.push(new Buffer(chunk));
      });
      res.on('end', (chunk) => {
        resolve(Buffer.concat(respchunks).toString('utf8'));
      });
      res.on('error', (e) => {
        reject(e);
      });
    });
    req.write(jsonbody);
    req.end();
  });

  p.then((body) => {
    callback(JSON.parse(body));
  }).catch((err) => handleErrors(err));
}



module.exports = {makeRequest}
