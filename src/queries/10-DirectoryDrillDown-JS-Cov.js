
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
var Client = require('../client/Client');
var ClientFilter = require('./ClientFilter');
var deepcopy = require("lodash.clonedeep");
var Errors = require("../Errors");

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

var directoryDrillDown = { 
  name: 'Directory Drilldown Folders',
  obj:  {
    filter_revision: true,
    drills_down: true,
    drilldown_context: 'chrome://',
    format_headers: true,
    query_override: true,
    remote_request:{
      "from":"coverage-summary",
      "select":[
        {"aggregate":"count"},
        {"value":"source.file.total_uncovered","aggregate":"sum"},
        {"value":"source.file.total_covered","aggregate":"sum"}
      ],
      "where":{"and": [
        {"prefix":{"source.file.name":"chrome://mochikit/content/tests/SimpleTest/"}},
        {"eq":{"build.revision12":"d19d1d2136bb"}},
        {"missing":"test.url"}
      ]},
      "groupby":[{
      "name":"file",
      "value":{
        "left":[
          "source.file.name",
          {"add":[
            1,
            {
              "find":{"source.file.name":"/"},
              "start":43,
              "default":{"length":"source.file.name"}
            }
          ]}
        ]
        }
      }],
      "limit":1000
    },
    drillUp: function(drillDownContext) {
      if (!drillDownContext) {
        return this.drilldown_context;
      }
      return drillDownContext.substr(0, drillDownContext.substr(0, 
            drillDownContext.length-1).lastIndexOf("/")+1);
    },
    drillDown: function(selectedRow, drillDownContext) {
      if (!drillDownContext) {
        drillDownContext = this.drilldown_context;
      }

      // This one is used if we want to remove the path
      drillDownContext += selectedRow[0].val;
      //drillDownContext = selectedRow[0].val; 

      var remote_request_copy = JSON.parse(JSON.stringify(this.remote_request));
      // TODO(brad) this does NOT set the revision? DOES IT?
      
      ClientFilter.setProp(remote_request_copy, 'source.file.name', 
          drillDownContext);
      return {
        context: drillDownContext, remote_request: remote_request_copy
      };
    },
    override: function(query, context) {
      context = context || "chrome://";
      
      ClientFilter.setProp(query, "start", context.length);
      ClientFilter.setProp(query, "source.file.name", context);
      return new Promise((res, rej) => {
        Errors.handleError(Errors.info, "Query sent: " + 
            JSON.stringify(query));

        Client.makeRequest('activedata.allizom.org', query, (data) => {
          var colours = ["#74c274", "#f2b968", "#de6c69"];
          var levels = [0.9, 0.70, 0.0]; 
          var headers = [
            "Directory", 
            {title: "Bar", type:"bar", colours: colours, levels: levels},
            {title: "Covered %", type:"bg", colours: colours, levels: levels}, 
            {title: "Covered Lines", type:"bg", colours: colours, levels: levels}
          ];

          var rows = data.data.map((row) => {
            var dir = row[0];
            dir = dir.substr(dir.substr(0, dir.length-1).lastIndexOf("/")+1);
            var cov = row[1];
            var ucov = row[2];
            var lines = cov + ucov;
            return [
              dir, 
              cov/lines, 
              {text: `${((cov/lines)*100).toPrecision(3)} %`, val: cov/lines}, 
              {text: `${cov}/${lines}`, val: cov/lines}
            ];
          });

          res({header: headers, data: rows});
        });
      });
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
    processBody: null,
  }
};

module.exports = {[directoryDrillDown]};
