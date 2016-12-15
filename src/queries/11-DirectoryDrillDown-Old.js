/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var StringManipulation = require('../StringManipulation');
var Client = require('../client/Client');
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

var directoryDrillDown = { 
  name: 'Directory Drilldown Folders (Depreciated)',
  obj:  {
    path: "Legacy",
    filter_revision: true,
    drills_down: true,
    drilldown_context: 'chrome://',
    format_headers: true,
    query_override: true,
    remote_request: {
      "limit":100,
      "from":"coverage-summary",
      "where":{"and":[
        {"eq":{"build.revision12":"18a8dc43d170"}},
        {"missing":"test.url"},
        {"regexp":{"source.file.name":"chrome://.*"}}
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
      ]
    },
    drillUp: function(drillDownContext) {
      if (!drillDownContext) {
        return this.drilldown_context;
      }
      return drillDownContext.substr(0, drillDownContext.substr(0, 
            drillDownContext.length-3).lastIndexOf("/")+1);
    },
    drillDown: function(selectedRow, drillDownContext) {
      if (!drillDownContext) {
        drillDownContext = this.drilldown_context;
      }
      var dotstarindex = drillDownContext.indexOf(".*");
      if (dotstarindex != -1) {
        drillDownContext = drillDownContext.substring(0, dotstarindex);
      }
      drillDownContext = drillDownContext + selectedRow[0].val + '/.*';

      var remote_request_copy = JSON.parse(JSON.stringify(this.remote_request));
      
      ClientFilter.setProp(remote_request_copy, 'source.file.name', 
          drillDownContext);
      return {
        context: drillDownContext, remote_request: remote_request_copy
      };
    },
    override: function(query, context) {
      var dirs = [];
      var dirobj = this.getFolderWithContext(context);
      context = context || "chrome://.*";

      var tasks = [];
      for (var prop in dirobj) {
        var job = this.aggregateDir(query, prop,
            context.substring(0, context.lastIndexOf("/.*") + 1) + prop + "/.*");
        tasks.push(job);
      }
      
      return new Promise((res, rej) => {
        Promise.all(tasks).then((val) => {
          var colours = ["#74c274", "#f2b968", "#de6c69"];
          var levels = [0.9, 0.70, 0.0]; 
          var headers = ["Directory", 
                         {title: "Bar", type:"bar", colours: colours, levels: levels},
                         {title: "Covered %", type:"bg", colours: colours, levels: levels}, 
                         {title: "Covered Lines", type:"bg", colours: colours, levels: levels}];
          res({
            header: headers,
            data: val
          });
        });
      });
    },
    aggregateDir: function(query, prop, context) {
      var queryJSON = deepcopy(query);
      ClientFilter.setProp(queryJSON, 'source.file.name', context);

      return new Promise((res, rej) => {
        Client.makeRequest('activedata.allizom.org',
            queryJSON, (data) => {
          var cov = data.data.covered;
          var ucov = data.data.uncovered;
          var lines = cov + ucov;
          res([prop, cov/lines, 
              {text: `${((cov/lines)*100).toPrecision(3)} %`, val: cov/lines}, 
              {text: `${cov}/${lines}`, val: cov/lines}]);
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
    getFolderWithContext: function(c) {
      var path = c.substring(c.indexOf("//")+1, c.lastIndexOf("/.*"));
      var folders = this.getFolders();
      var directorySplit = path.split("/");
      var res = folders["chrome://"];
      for (var i = 1; i < directorySplit.length; i++) {
        res = res[directorySplit[i]];
      }
      return res; 
    },
    getFolders: function() { 
      return {
        "chrome://": {
          "browser":{"content":{"downloads": null, "places": null}},
          "extensions":{"content": null},
          "global":{"content": {"bindings": null}},
          "marionette":{"content": null},
          "mochikit":{"content": null},
          "pocket":null,
          "satchel":null,
          "specialpowers":null
        }
      };
    }
  }
};

module.exports = {[directoryDrillDown]};
