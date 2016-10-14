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

var Client = require('../client/client');

var TableHeadData = React.createClass({
  render: function() {
    var items = [];
    this.props.data.forEach((d) => {items.push(<th key={d.id}>{d.val}</th>);});
    return (
      <thead><tr>
        {items}
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

var CocoTable = React.createClass({
  getInitialState: function() {
    return {query: Client.testQuery, data: null};
  },
  componentWillMount: function() {
    this.sendQuery();
  },
  componentWillUnmount: function() {
  },
  _onChange: function() {
    this.forceUpdate();
  },
  sendQuery: function() {
    if (this.state.query == null) {
      return;
    }
    Client.makeRequest('activedata.allizom.org',
        Client.testQuery, (data) => {
      console.log(data);
      this.state.data = {};
      // Get the name prop of the header objects
      this.setState({
        data: {
          headers: data.header,
          rows: data.data
        }
      });
    }); 
  },
  render: function() {
    if (this.state.data == null) {
      return (<h4>No data!</h4>);
    }
    var rows = [];
    this.state.data.rows.forEach((row) => {
      rows.push(<TableRowData data={addIndexArray(row)}/>);
    });
    return (
      <Table striped condensed hover>
        <TableHeadData data={addIndexArray(this.state.data.headers)}/>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
});

var addIndexArray = function(li) {
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
      <Sidebar><NavOptions/></Sidebar>
      <Grid fluid>
      <Row>
      <Col sm={12}>
      <CocoTable />
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
 



