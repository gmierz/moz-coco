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

var StringManipulation = require('../StringManipulation'); 

var allQueries = [
  { 
    name: 'Coverage by Filename',
    obj:  {
      obj: ClientConstants.testQuery,
      processPre: (d)=>{},
      processHeaders: (d) => {
        return d.map(StringManipulation.header)
      },
      processBody: (d)=>{return d;}
    }
  }
];

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
    var items = [];
    this.props.data.forEach((d) => {items.push(<td key={d.id}>{d.val}</td>);});
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
      for (var key in allItems) {
        items.push(<NavItem 
          onSelect={this.handleSelect(key)} 
          key={key}>{allItems[key].title}</NavItem>);
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
        return {"collapsed": false};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    allQueries.forEach((q) => {
      PageActions.create(q.name, q.obj);
    });
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.forceUpdate();
  },
  render: function() {
    var classnametxt = "sidebar";
    var imgico = <img src="icons/android-chrome-512x512.png" className=
            "img-responsive" width="150"></img>;
    var banner = 
        <div className={"bottom"}>
          Coco made with ❤️ by the Code Coverage team
        </div>;
    if(PageStore.getCollapsed()) {
      classnametxt += " collapsed";
      imgico = banner = [] 
    }
    return (
      <div id="sidebar" className={classnametxt}>
        <div style={{textAlign: "right"}}>
          <NavButton callback={function() {
            PageActions.toggleSidebar();
          }}/>
          {imgico}
        </div>
        {this.props.children} 
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
    this.setState({query: PageStore.getQuery()});
    this.sendQuery();
  },
  sendQuery: function() {
    if (this.state.query == null || this.state.query == "") {
      return;
    }
    Client.makeRequest('activedata.allizom.org',
        this.state.query.obj, (data) => {
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
    // Any preprocessing
    this.state.query.processPre(this.state.data);
    var rows = [];
    // Any row processing
    var rowdata = addIndexArray(
      this.state.query.processBody(this.state.data.rows));
    rowdata.forEach((row) => {
      rows.push(<TableRowData key={row.id} data={addIndexArray(row.val)}/>);
    });
    // Any head processing
    var headers = this.state.query.processHeaders(this.state.data.headers);
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
 



