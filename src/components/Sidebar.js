
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React from 'react';
import ReactDOM from 'react-dom';

import {Button, Nav, NavItem, MenuItem, NavDropdown, ControlLabel,
FormControl, InputGroup, FormGroup, ButtonToolbar, DropdownButton} from 'react-bootstrap';

import InfoModal from './InfoModal';
import ClientConstants from '../client/ClientConstants';

import PageStore from '../stores/PageStore';
import PageActions from '../actions/PageActions';

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
        <ButtonToolbar>
          <DropdownButton bsSize="large" title="Revision ID" id="dropdown-size-large">
            <MenuItem eventKey="1">4253e14676c2</MenuItem>
            <MenuItem eventKey="2">6d1633095a92</MenuItem>
            <MenuItem eventKey="3">26ced60e971a</MenuItem>
          </DropdownButton>
        </ButtonToolbar>
      </FormGroup>
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
  upLevel: function() {
    PageActions.setSelected("");
    PageActions.setContext(PageStore.getQuery().drillUp(PageStore.getContext()));
    PageStore.emitChange('query');
  },
  render: function() {
    if (this.state.hidden) return (<div></div>);
    return (
      <FormGroup>
      <ControlLabel>{this.props.header}</ControlLabel>
      <InputGroup>
        <FormControl type="text" value={this.state.value}
        placeholder="Context" disabled />
        <InputGroup.Button>
          <Button onClick={this.upLevel}>Drill Up</Button>
        </InputGroup.Button>
      </InputGroup>
      </FormGroup>
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

    ClientConstants.forEach((q) => {
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
      displayChildren = false;
    }
    return (
      <div id="sidebar" className={classnametxt}>
        <div style={{textAlign: "right"}}>
          <NavButton callback={function() {
            PageActions.toggleSidebar();
          }}/>
          {displayChildren && imgico}
        </div>
        {displayChildren && 
        <div>
          {this.props.children}
          {contextview}
          {PageStore.getQuery().filter_revision}
          <RevisionSetter />
          <InfoModal/>
        </div>
        }
        {displayChildren && banner}
      </div>
    );
  }
});

export {Sidebar, NavOptions};
