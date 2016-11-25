
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
    name: 'All Test Files',
    obj: {
      filter_revision: true,
      remote_request: {
        "from":"coverage-summary",
        "edges":"source.file.name",
        "where":{"and":[
          {"eq":{"build.revision12":"18a8dc43d170"}},
          {"regexp":{"source.file.name":".*/test/.*"}}
        ]},
        "limit":10000,
      },
      processPre: (comp, d)=>{
        comp.setState({
          data: {
            headers: ["Source File Name"],
            rows: d.edges[0].domain.partitions.map((o) => {return [o.name];}) 
           }
        });
      },
      processHeaders: (d) => {
        return d.map(StringManipulation.header)
      },
      processBody: null
    }
  }
];

module.exports = {allQueries};
