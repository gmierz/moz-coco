var React = require('react');
var ReactDOM = require('react-dom');
var Table = require('react-bootstrap/lib/Table');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');

var TableHeadData = React.createClass({
	render: function() {
		return (
      <thead><tr>
        {this.props.data.map(function(d) {
          return <th key={d.id}>{d.val}</th>;
        })}
      </tr></thead>
    );
  }
});

var TableRowData = React.createClass({
	render: function() {
		return (
      <tr>
        {this.props.data.map(function(d) {
          return <td key={d.id}>{d.val}</td>;
        })}
      </tr>
    );
  }
});

var AddIndexArray = function(li) {
        var i = 0;
        return li.map(function(l) {
                i++;
                return {"id": i, "val": l};
        });
}
         

ReactDOM.render((
  <Grid fluid>
  <Grid>
  <Row>
  <Col sm={9} md={6}>
  <Table striped condensed hover>
  <TableHeadData data={AddIndexArray(["head1", "head2"])}/>
  <tbody>
	<TableRowData data={AddIndexArray(["one", "two"])}/>
  </tbody>
  </Table>
  </Col>
  </Row>
  </Grid>
  </Grid>
  ), document.getElementById('react-root')
);
 



