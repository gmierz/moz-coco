
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
    return {revision: PageStore.getRevision(), revision_list: PageStore.getRevisionList()}
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
  doSetRevision: function (e) {
      this.setState({revision: e.target.value});
      PageActions.setRevision(e.target.value);
  },
  renderRevisions: function() {
      var revision_list = [];
      for (var i in this.state.revision_list) {
          var buildDate = new Date(this.state.revision_list[i].build.date * 1000).toISOString();
          var buildRevision = this.state.revision_list[i].build.revision12;
          var buildCount = this.state.revision_list[i].count;
          var buildLanguage = "";
          try {
              buildLanguage = this.state.revision_list[i].source.language;
          } catch(e) {}
          if(buildLanguage){
              revision_list.push(
                <option value={buildRevision}>
                    {buildDate} | {buildRevision} | {buildCount} | {buildLanguage}
                </option>);
          } else {
              revision_list.push(
                <option value={buildRevision}>
                    {buildDate} | {buildRevision} | {buildCount}
                </option>);
          }
      }
      return revision_list;
  },
  render: function() {
    return (
      <FormGroup>
        <ControlLabel>Select Revision (Last 2 months)</ControlLabel>
        <FormControl onChange={this.doSetRevision} value={this.state.value} componentClass="select">
          <option selected="selected" disabled>Select a revision...</option>
          {this.renderRevisions()}
        </FormControl>
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
        var common = <div>
              {allItems[key].query.filter_revision && 
                <img height="16px" alt="Revision modifiable" src="icons/rev.png"/>}
              {allItems[key].query.drills_down && 
                <img height="16px" alt="Drilldown enabled" src="icons/drill.png"/>}
              {" "}
              {allItems[key].title}
        </div>;
        if (allItems[key].query.hasOwnProperty('path')) {
          // Has path
          if (!dirs.hasOwnProperty(allItems[key].query.path)) {
            dirs[allItems[key].query.path] = []; 
          }
          dirs[allItems[key].query.path].push(
            <MenuItem onSelect={this.handleSelect(key)} key={key}>
              {common}
            </MenuItem>
          );
            
        } else {
          // Root
          items.push(
            <NavItem 
            onSelect={this.handleSelect(key)} 
            key={key}>
              {common}
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
          <p>
            Report a bug or request a feature
            <a href="https://github.com/ericdesj/moz-codecover-ui/issues/new"> here</a>
          </p>
          <p>
            Coco made with ♥ by the Code Coverage team
          </p>
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
