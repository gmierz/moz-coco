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


var NavButton = React.createClass({
  render: function() {
    return (
      <button onClick={this.props.callback}>
      <i className="fa fa-bars" aria-hidden="true" ></i>
      </button>
    );
  }
});

var Sidebar = React.createClass({
  getInitialState: function() {
        return {collapsed: false};
  },
  render: function() {
    return (
      <div id="sidebar" className="sidebar">
        <NavButton callback={function() { 
          var sb = document.getElementById("sidebar");
          var wrapper = document.getElementById("page-wrapper");
          if (this.state.collapsed) {
            this.state.collapsed = false; 
            sb.setAttribute("class", "sidebar");
            wrapper.setAttribute("class", "page-wrapper");
          } else {
            this.state.collapsed = true;
            sb.setAttribute("class", "sidebar collapsed");
            wrapper.setAttribute("class", "page-wrapper collapsed");
          }
        }.bind(this)}/>
        
      </div>
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
  <div id="page-wrapper" className="page-wrapper">
  <Sidebar /> 
  <Grid fluid>
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
  </div>
  ), document.getElementById('react-root')
);
 



