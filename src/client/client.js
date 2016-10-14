var request = require('request');

var handleErrors = function(err) {
  console.log(err);
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

function makeRequest(url, body, callback) {
  options = {
    "url": url,
    "body": body,
    "json": true
  }
  p = new Promise((resolve, reject) => { 
    request.post(options, (err, resp, body) => {
      if (!err) {
        resolve(body);
      } else {
        reject(err);
      } 
    });
  });

  p.then((body) => {
    callback(body);
  }).catch((err) => handleErrors(err));
}



module.exports = {makeRequest, testQuery}
