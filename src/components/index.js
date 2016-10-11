var React = require('react');
var ReactDOM = require('react-dom');
var Table = require('react-bootstrap/lib/Table');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Button = require('react-bootstrap/lib/Button');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');

var PageStore = require('../stores/PageStore');
var PageActions = require('../actions/PageActions');

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
    return {};
  },
  componentDidMount: function() {
    PageStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.forceUpdate();
  },
  render: function() {
    var shown = !PageStore.getCollapsed();
    var items = [];
    if (shown) {
      var allItems = PageStore.getAll();
      for (var key in allItems) {
        items.push(<NavItem key={key}>{allItems[key].title}</NavItem>);
      }
    }
    return (
      <Nav stacked activeKey={1} 
        onSelect={handleSelect} style={{marginTop: '20px'}}>
        {items}
      </Nav>
    );
  }
});

var navOpts = <NavOptions/>;

var Sidebar = React.createClass({
  getInitialState: function() {
        return {"collapsed": false};
  },
  componentWillMount: function() {
    // TODO(brad) proper callback
    PageStore.addChangeListener(this._onChange);
    PageActions.create("Title 1", "");
    PageActions.create("Title 2", ""); 
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.forceUpdate();
  },
  render: function() {
    var classnametxt = "sidebar";
    if(PageStore.getCollapsed()) {
      classnametxt += " collapsed";
    }
    return (
      <div id="sidebar" className={classnametxt}>
        <NavButton callback={function() {
          PageActions.toggleSidebar();
          }}/>
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

var TopLevel = React.createClass({
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.forceUpdate();
  },
  render: function() {
    var classnametxt = "page-wrapper";
    if (PageStore.getCollapsed()) {
      classnametxt += " collapsed";
    } 
    return ( 
      <div id="page-wrapper" className={classnametxt}>
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
    );
  }
});      

ReactDOM.render(
  <TopLevel />
  , document.getElementById('react-root')
);
 



