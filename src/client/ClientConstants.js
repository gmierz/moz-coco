
/* 
 * This is intended to be the location of the stored queries
 */

var StringManipulation = require('../StringManipulation'); 

/* Queries have the following objects
 * name, which is the display string,
 * obj which contains the query instructions
 * within obj there is another obj which is the query in JSON
 * there is also three functions:
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
    name: 'Coverage by Filename',
    obj:  {
      obj: {
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
      processBody: null
    }
  },
  {
    name: 'All Test Files',
    obj: {
      obj: {
        "from":"coverage-summary",
        "edges":"source.file.name",
        "where":{"regexp":{"source.file.name":".*/test/.*"}},
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
