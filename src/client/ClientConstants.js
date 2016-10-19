
/* 
 * This is intended to be the location of the stored queries
 */

const testQuery = {
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

module.exports = {testQuery};
