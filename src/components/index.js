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

var Client = require('../client/Client');
var ClientConstants = require('../client/ClientConstants');

var TableHeadData = React.createClass({
  render: function() {
    var items = this.props.data.map((d) => {
      return <th key={d.id}>{d.val}</th>;
    });
    return (
      <thead><tr>
        {items}
      </tr></thead>
    );
  }
});

var TableRowData = React.createClass({
  render: function() {
    var items = this.props.data.map((d) => {
      return <td key={d.id}>{d.val}</td>;
    });
    return (
      <tr>
        {items}
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
  handleSelect: function(key) {
    return () => {
      PageActions.change(key);
    };
  },
  render: function() {
    var shown = !PageStore.getCollapsed();
    var items = [];
    if (shown) {
      var allItems = PageStore.getAll();
      // Object works well with for each
      for (var key in allItems) {
        items.push(
          <NavItem 
          onSelect={this.handleSelect(key)} 
          key={key}>{allItems[key].title}</NavItem>
        );
      }
    }
    return (
      <Nav stacked activeKey={1} style={{marginTop: '20px'}}>
        {items}
      </Nav>
    );
  }
});


var Sidebar = React.createClass({
  getInitialState: function() {
        return {"collapsed": false, "opening": false};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    // Seed the Sidebar with queries
    ClientConstants.allQueries.forEach((q) => {
      PageActions.create(q.name, q.obj);
    });
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    var pscollapsed = PageStore.getCollapsed();
    if (this.state.collapsed && !pscollapsed) {
      this.setState({"collapsed": pscollapsed, "opening": true});

      setTimeout(() => {
        this.setState({"opening": false});
      }, 500);
   } else {
    this.setState({"collapsed": pscollapsed}); 
   }
  },
  render: function() {
    var classnametxt = "sidebar";
    var imgico = <img src="icons/android-chrome-512x512.png" className=
            "img-responsive" width="150"></img>;
    var banner = 
        <div className={"bottom"}>
          Coco made with ❤️ by the Code Coverage team
        </div>;

    // This creates the animation
    if (this.state.collapsed) {
      classnametxt += " collapsed";
    }
    var displayChildren = true;
    if (this.state.collapsed || this.state.opening) {
      imgico = banner = [];
      displayChildren = false;
    }
    return (
      <div id="sidebar" className={classnametxt}>
        <div style={{textAlign: "right"}}>
          <NavButton callback={function() {
            PageActions.toggleSidebar();
          }}/>
          {imgico}
        </div>
        {displayChildren ? this.props.children : false} 
        {banner}
      </div>
    );
  }
});

var CocoTable = React.createClass({
  getInitialState: function() {
    return {query: PageStore.getQuery(), data: null};
  },
  componentWillMount: function() {
    this.sendQuery();
    PageStore.addChangeListener(this._onChange, 'query');
  },
  componentWillUnmount: function() {
  },
  _onChange: function(e) {
    this.setState({data: null, query: PageStore.getQuery()}, this.sendQuery);
  },
  sendQuery: function() {
    if (this.state.query == null || this.state.query == "") {
      return;
    }
    Client.makeRequest('activedata.allizom.org',
        this.state.query.obj, (data) => {
      // If null do not pre process
      this.state.data = data;
      if (this.state.query.processPre) {
        this.state.query.processPre(this, data);
      }
    }); 
  },
  render: function() {
    if (this.state.data == null) {
      return (
          <div className="row loading-bar">
            Loading... <br></br>
            <img src="icons/8-1.gif"></img>
          </div>
      );
    }
    // Any row processing
    var rows = this.state.data.rows;
    if (this.state.query.processBody) {
      rows = this.state.query.processBody(rows);
    }
    rows = addIndexArray(rows);
    rows = rows.map((row) => {
      return <TableRowData key={row.id} data={addIndexArray(row.val)}/>});
    // Any head processing
    var headers = this.state.data.headers;
    // Variable usage of processHeaders
    if (this.state.query.processHeaders) {
      headers = this.state.query.processHeaders(headers);
    }
    return (
      <Table striped condensed hover>
        <TableHeadData data={addIndexArray(headers)}/>
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
