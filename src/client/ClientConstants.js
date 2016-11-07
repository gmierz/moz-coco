
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

/* 
 * This is intended to be the location of the stored queries
 */

var StringManipulation = require('../StringManipulation');
var ClientFilter = require('./ClientFilter');
var deepcopy = require("lodash.clonedeep");

/* Queries have the following objects:
 * name, which is the display string,
 *
 * obj which contains the query instructions
 *
 * within obj there is remote_request which is the query in JSON
 *
 * filter_revision is a boolean flag for if the query may be filtered
 * by build.revision12, if it is true we will try and find a where clause
 * in that mentions the aformentioned property, if filter_revision isn't set
 * or is false we will not remove the filter but instead not modify the query
 *
 * There is also three functions:
 * processPre(component, data) which allows you to mutate
 *   the state of the component on injestion of data, this may be left null
 *   but may be relatively useless without doing so
 * processHeaders(data) takes in a header array and returns a header array
 *   with modifications to the elements, may be null
 * processBody(data) takes in a array of arrays and returns an array of arrays,
 *   may be null.
 */
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
            r[0] = new Date(r[0]*1000).toISOString();
          }
          return r;
        });
      }
    }
  },
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
  },
];

// This section intends to implement the queries in
// https://github.com/chinhodado/codecoverage_presenter/tree/gh-pages/js/query
var queriescc_presenter = [{
    // https://github.com/chinhodado/codecoverage_presenter/blob/gh-pages/js/query/query1.js
    name: "Coverage Summary Max Score per Revision",
    obj: {
      path: "Experimental",
      filter_revision: true,
      remote_request: {
        "from":"coverage-summary",
        "where":{"and":[
          {"eq":{"build.revision12":"18a8dc43d170"}},
          {"missing":"source.method.name"}
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
  },
];

/* 
 * Single example of drilldowns
 */

var drill = { 
  name: 'JS Coverage by Directory placeholder',
  obj:  {
    filter_revision: true,
    path: 'JS Coverage by Directory',
    drills_down: true,
    drilldown_context: 'chrome://',
    remote_request: {
      "limit":100,
      "from":"coverage-summary",
      "where":{"and":[
        {"eq":{"build.revision12":"18a8dc43d170"}},
        {"missing":"test.url"},
        {"regexp":{"source.file.name":"chrome://.*"}},
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
    },
    drillDown: function(selectedRow, drillDownContext) {
      if (!drillDownContext) {
        drillDownContext = this.drilldown_context;
      }
      var dotstarindex = drillDownContext.indexOf(".*");
      if (dotstarindex != -1) {
        drillDownContext = drillDownContext.substring(0, dotstarindex);
      }
      // selectedRow
      // "chrome://blah/foo/bar/"
      // drillDownContext
      // "chrome://"

      // blah/foo/bar/
      var remainder = selectedRow[0].val.substring(drillDownContext.length);
      
      // blah 
      var next_path = remainder.split('/')[0];
      drillDownContext = drillDownContext + next_path + '/.*';

      var remote_request_copy = JSON.parse(JSON.stringify(this.remote_request));
      
      ClientFilter.setProp(remote_request_copy, 'source.file.name', 
          drillDownContext);
      return {context: drillDownContext, remote_request: remote_request_copy};
    },
    processPre: function(comp, d) {
      comp.setState({
        data: {
          headers: d.header,
          rows: d.data
         }
      });
    },
    processHeaders: function(d) {
      return d.map(StringManipulation.header)
    },
    processBody: null
  }
};

var mdrilldowns = [];

var variants = ["browser", "extensions", "global", "marionette", "mochikit",
    "pocket", "satchel", "specialpowers"];
variants.forEach((v) => {
  var copy = deepcopy(drill);
  copy.name = "Folder chrome://" + v;
  copy.obj.drilldown_context = 'chrome://'+v+'/.*';
  ClientFilter.setProp(copy, 'source.file.name', 'chrome://'+v+'/.*');
  
  mdrilldowns.push(copy);
});
Array.prototype.push.apply(allQueries, queriescc_presenter);
Array.prototype.push.apply(allQueries, mdrilldowns);
module.exports = {allQueries};
