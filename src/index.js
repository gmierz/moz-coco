var React = require('react');
var ReactDOM = require('react-dom');
var Table = require('react-bootstrap/lib/Table');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Button = require('react-bootstrap/lib/Button');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');

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
      <Button onClick={this.props.callback}>
      <i className="fa fa-bars" aria-hidden="true" ></i>
      </Button>
    );
  }
});

var handleSelect = function(n) {
};

var NavOptions = React.createClass({
  getInitialState: function() {
    return { shown : true };
  },
  render: function() {
    var navClass = 'nav nav-pills nav-stacked';
    if (!this.state.shown) navClass += " collapsed";
    return (
      <Nav className={navClass} bsStyle="pills" stacked activeKey={1} 
        onSelect={handleSelect} style={{marginTop: '20px'}}>
        <NavItem eventKey={1}>Option 1</NavItem>
        <NavItem eventKey={2}>Option 2</NavItem>
        <NavItem eventKey={3}>Option 3</NavItem>
      </Nav>
    );
  }
});

var navOpts = <NavOptions/>;

var Sidebar = React.createClass({
  getInitialState: function() {
        return {"collapsed": false};
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
          }}.bind(this)}/>
        {this.props.children} 
      </div>
    );
  }
});

var sideBar = <Sidebar>{navOpts}</Sidebar>;

var AddIndexArray = function(li) {
  var i = 0;
  return li.map(function(l) {
    i++;
    return {"id": i, "val": l};
  });
}

         

ReactDOM.render((
  <div id="page-wrapper" className="page-wrapper">
  {sideBar} 
  <Grid fluid>
  <Row>
  <Col sm={12}>
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
 



