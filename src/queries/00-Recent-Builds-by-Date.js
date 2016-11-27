
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
    name: "Recent Builds by Date",
    obj: {
      remote_request: {
      "from":"coverage-summary",
        "limit":1000,
        "groupby":["build.date","build.revision12"]
      },
      processPre: (comp, d)=>{
        d.data.sort((b, a) => {
          if (a[0] == null) return -1;
          if (b[0] == null) return 1;
          return parseInt(a[0]) < parseInt(b[0]) ? -1 : 1;
        });
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
        return d.map(r => {
          if (r[0]) {
            var tdate = r[0]*1000;
            tdate -= tdate % 1;
            r[0] = new Date(tdate).toISOString().replace(/T/, " ");
          }
          return r;
        });
      }
    }
  }
];

module.exports = {allQueries};
