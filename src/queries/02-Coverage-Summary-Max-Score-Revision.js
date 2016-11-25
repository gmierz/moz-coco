
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var StringManipulation = require('../StringManipulation');

var allQueries = [
  {
    // https://github.com/chinhodado/codecoverage_presenter/blob/gh-pages/js/query/query1.js
    name: "Coverage Summary Max Score per Revision",
    obj: {
      path: "Legacy",
      filter_revision: true,
      remote_request: {
        "from":"coverage-summary",
        "where":{"and":[
          {"eq":{"build.revision12":"18a8dc43d170"}},
        ]},
        "limit":10000,
        "select":{
          "name":"Max Score",
          "value":"source.file.score",
          "aggregate":"maximum"
        },
        "groupby":["source.file.name"]
      },
      processPre: (comp, d)=>{
        comp.setState({
          data: {
            headers: d.header,
            rows: d.data
           }
        });
      },
      processHeaders: (d) => {
        return d.map(StringManipulation.header)
      },
      processBody: (d) => {
        return d.map((r) => {
          r[1] = r[1].toPrecision(6);
          return r;
        });
      }
    }
  }
];

module.exports = {allQueries};
