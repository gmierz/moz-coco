
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var React = require('react');
var ReactDOM = require('react-dom');
var Table = require('react-bootstrap/lib/Table');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Button = require('react-bootstrap/lib/Button');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var NavDropdown = require('react-bootstrap/lib/NavDropdown');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var FormControl = require('react-bootstrap/lib/FormControl');
var InputGroup = require('react-bootstrap/lib/InputGroup');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');

var PageStore = require('../stores/PageStore');
var PageActions = require('../actions/PageActions');

var Client = require('../client/Client');
var ClientFilter = require("../client/ClientFilter");
var ClientConstants = require('../client/ClientConstants');

var DEVON = true;

var Errors = {
  fatal: "fatal",
  error: "error",
  warn: "warn",
  info: "info",
  callback: function(level, message) {
    console.log(`${level}: ${message}`); 
  },
  handleError: function(level, message) {
    var perr = "During a previous error a programmer error"
        + " occurred while processing the previous error";
    if (!this.callback) {
      console.log(`${level}: ${message}`); 
      console.log(perr);
      return;
    }
    if (!this.hasOwnProperty(level) || !(typeof this[level] === 'string')) {
      this.callback(this.warn, message);
      this.callback(this.warn, perr);
      return;
    }
    this.callback(level, message);
  }
}

var RevisionSetter = React.createClass({
  getInitialState: function() {
    return {revision: PageStore.getRevision()} 
  },
  componentDidMount: function() {
    PageStore.addChangeListener(this._onChange, 'query');
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange, 'query');
  },
  _onChange: function() {
    this.setState({revision: PageStore.getRevision()});
  },
  handleR: function(e) {
    this.setState({revision: e.target.value});
  },
  doSet: function() {
    PageActions.setRevision(this.state.revision);
  },
  render: function() {
    return (
      <FormGroup>
        <ControlLabel>Revision ID</ControlLabel>
        <InputGroup>
          <FormControl onChange={this.handleR} type="text" placeholder="Revision"
            value={this.state.revision || ""} />
          <InputGroup.Button>
            <Button onClick={this.doSet}>Set</Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
});

var TableHeadData = React.createClass({
  render: function() {
    var items = this.props.data.map((d) => {
      if (typeof(d.val) == "string") {
        return <th key={d.id}>{d.val}</th>;
      } else {
        return <th key={d.id}>{d.val.title}</th>;
      }
    });
    return (
      <thead><tr>
        {items}
      </tr></thead>
    );
  }
});

var TableRowData = React.createClass({
  onCellClick: function(event) {
    // Set selected to this prop data
    PageActions.setSelected(this.props.data.rows);
    // Drill Down Function 
  },
  render: function() {
    if (this.props.data.headers) {
      var items = [];
      var headers = this.props.data.headers;
      var cells = this.props.data.rows;
      for (var i = 0; i < headers.length; i++) {
        if (typeof(headers[i]) == "string") {
          items.push(<td key={cells[i].id}>{cells[i].val}</td>);
        }
        else if (headers[i].type == "bg") {
          for (var ci = 0; ci < headers[i].levels.length; ci++) {
            if (cells[i].val.val >= headers[i].levels[ci]) {
              var bgcol = headers[i].colours[ci];
              break;
            }
          }
          items.push(<td key={cells[i].id} 
              style={{backgroundColor: bgcol, color: "#fff"}}>
              {cells[i].val.text}</td>);
        } else if (headers[i].type == "bar") {
          const levels = ["success","warning","danger"];
          for (var ci = 0; ci < headers[i].levels.length; ci++) {
            if (cells[i].val >= headers[i].levels[ci]) {
              var col = ci
              break;
            }
          }
          var pval = cells[i].val*100;
          items.push(<td key={cells[i].id}><ProgressBar striped bsStyle={levels[col]}
              now={pval}/></td>);
        } else {
          items.push(<td key={cells[i].id}>{cells[i].val.text}</td>);
        }
      }
        
    } else {
      var items = this.props.data.rows.map((d) => {
          return <td key={d.id}>{d.val}</td>;
      });
    }
    if (!this.props.drill_down) {
      return (<tr>{items}</tr>);
    }
    return (
      <tr onClick={this.onCellClick}>
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
      var dirs = {};
      // Object works well with for each
      for (var key in allItems) {
        if (allItems[key].query.hasOwnProperty('path')) {
          // Has path
          if (!dirs.hasOwnProperty(allItems[key].query.path)) {
            dirs[allItems[key].query.path] = []; 
          }
          dirs[allItems[key].query.path].push(
            <MenuItem onSelect={this.handleSelect(key)} key={key}>
              {allItems[key].query.filter_revision && "R* "}
              {allItems[key].query.drills_down && "D* "}
              {allItems[key].title}
            </MenuItem>
          );
            
        } else {
          // Root
          items.push(
            <NavItem 
            onSelect={this.handleSelect(key)} 
            key={key}>
              {allItems[key].query.filter_revision && "R* "}
              {allItems[key].query.drills_down && "D* "}
              {allItems[key].title}
            </NavItem>
          );
        }
      }
      Object.keys(dirs).forEach((key) => {
        items.push(<NavDropdown id={key} key={key} title={key}>{dirs[key]}</NavDropdown>);
      });
    }
    return (
      <Nav stacked activeKey={1} style={{marginTop: '20px'}}>
        {items}
      </Nav>
    );
  }
});

var PropertyViewer = React.createClass({
  getInitialState: function() {
    return {"hidden": true};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange, 'drill');
    this._onChange();
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange, 'drill');
  },
  _onChange: function() {
    var ctx = PageStore.getContext();
    if (ctx) {
      this.setState({hidden: false, value: ctx});
    } else {
      this.setState({hidden: true});
    }
  },
  render: function() {
    if (this.state.hidden) return (<div></div>);
    return (
      <form>
      <ControlLabel>{this.props.header}</ControlLabel>
      <FormControl type="text" value={this.state.value}
      placeholder="Context" disabled />
      </form>
    );
  }
});

var Sidebar = React.createClass({
  getInitialState: function() {
        return {"collapsed": false, "opening": false};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    PageStore.addChangeListener(this._onChange, 'query');
    // Seed the Sidebar with queries
    // TODO(brad) put this somewhere else
    ClientConstants.allQueries.forEach((q) => {
      PageActions.create(q.name, q.obj);
    });
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
    PageStore.removeChangeListener(this._onChange, 'query');
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
          Coco made with ♥ by the Code Coverage team
        </div>;

    var contextview = <PropertyViewer header={'Context'} />;

    // This creates the animation
    if (this.state.collapsed) {
      classnametxt += " collapsed";
    }
    var displayChildren = true;
    if (this.state.collapsed || this.state.opening) {
      imgico = banner = contextview = [];
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
        {displayChildren && this.props.children}
        {contextview}
        {displayChildren && PageStore.getQuery().filter_revision && <RevisionSetter />}
        {banner}
      </div>
    );
  }
});

var CocoTable = React.createClass({
  getInitialState: function() {
    return {query: PageStore.getQuery(), data: null, drillDownContext: null};
  },
  componentWillMount: function() {
    if (!PageStore.getRevision()) {
      PageActions.setRevision("d19d1d2136bb");
    }
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
    // If filter_revision is set we need to modify the revision number
    var queryJSON = this.state.query.remote_request;

    if (this.state.query.filter_revision) {
      // Mutates original query
      var revision = PageStore.getRevision();

      if(!ClientFilter.setRevision(queryJSON, revision)) {
        Errors.handleError(Errors.warn, "filter_revision was set in query but"
          + " was not able to be set through a search of the query, data may"
          + " be not as expected, or represent another revision");
      }
    }

    if (this.state.query.drills_down && PageStore.getSelected()) {
      var ddresults = this.state.query.drillDown(PageStore.getSelected(), 
          PageStore.getContext());
      // ddresults.context remote_request
      // TODO(brad) This seems bad
      PageActions.setContext(ddresults.context);
      queryJSON = ddresults.remote_request;
    }
    if (this.state.query.query_override) {
      var prom;
      if (ddresults) {
        prom = this.state.query.override(
            ddresults.remote_request, ddresults.context);
      } else {
        prom = this.state.query.override(this.state.query.remote_request, "");
      }
      prom.then((val) => {
        if (this.state.query.processPre) {
          this.state.query.processPre(this, val);
        }
      });
    } else {
      Client.makeRequest('activedata.allizom.org',
          queryJSON, (data) => {
        // If null do not pre process
        // TODO(brad) Unsure if this is legal
        this.state.data = data;
        if (this.state.query.processPre) {
          this.state.query.processPre(this, this.state.data);
        }
      });
    }
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
    // Any head processing
    var headers = this.state.data.headers;

    // Variable usage of processHeaders
    if (this.state.query.processHeaders && !this.state.query.format_headers) {
      headers = this.state.query.processHeaders(headers);
    }

    // Any row processing
    var rows = this.state.data.rows;
    if (this.state.query.processBody) {
      rows = this.state.query.processBody(rows);
    }
    rows = addIndexArray(rows);

    var drill_down = this.state.query.hasOwnProperty("drills_down");
    rows = rows.map((row) => {
      if (this.state.query.format_headers) {
        return <TableRowData drill_down={drill_down} key={row.id} data={{headers: headers,
          rows: addIndexArray(row.val),
        }} />
      } else { 
        return <TableRowData drill_down={drill_down} key={row.id} data={{
          rows: addIndexArray(row.val),
        }} />
      }
    });


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

if (DEVON) {
  Errors.handleError(Errors.warn, "Coco Development mode is currently on,"
    + " this is not a final project and should be expected to have no"
    + " reliability");
}
