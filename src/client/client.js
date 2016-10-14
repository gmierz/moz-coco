var https = require('https');

var handleErrors = function(err) {
  throw err;
}

var testQuery = {
  "limit":100,
  "from":"coverage-summary",
  "where":{"and":[
    {"missing":"test.url"},
    {"not":{"regexp":{"source.file.name":".*/test/.*"}}},
    {"not":{"regexp":{"source.file.name":".*/tests/.*"}}}
  ]},
  "select":[
    {
      "aggregate":"sum",
      "name":"covered",
      "value":"source.file.total_covered"
    },
    {
      "aggregate":"sum",
      "name":"uncovered",
      "value":"source.file.total_uncovered"
    }
  ],
  "groupby":[{"name":"filename","value":"source.file.name"}]
}

function makeRequest(host, body, callback) {
  var jsonbody = JSON.stringify(body);
  options = {
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



module.exports = {makeRequest, testQuery}
