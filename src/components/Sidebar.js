
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

import PageStore from '../stores/PageStore';
import PageActions from '../actions/PageActions';

var NavButton = React.createClass({
  render: function() {
    return (
      <Button onClick={this.props.callback}>
        <i className="fa fa-bars" aria-hidden="true" ></i>
      </Button>
    );
  }
});

var Sidebar = React.createClass({
  getInitialState: function() {
        return {"collapsed": true, "opening": false, "starter_bar": true};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    PageStore.addChangeListener(this._onSidebarChange, 'sidebar_change')
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
    PageStore.removeChangeListener(this._onSidebarChange, 'sidebar_change');
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
  _onSidebarChange: function() {
    this.setState({"starter_bar": !this.state.starter_bar});
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
          <Nav stacked activeKey={1} style={{marginTop: '20px'}}>
            <NavItem onClick={function () {
              PageStore.emitChange('cocopatchdiff');
            }}>
              <div><p>Coverage Patch Diff</p></div>
            </NavItem>
            <NavItem onClick={function () {
              PageStore.emitChange('placeholder_change');
            }}>
              <div><p> Sidebar placeholder </p></div>
            </NavItem>
          </Nav>
          <InfoModal/>
        </div>
        }
        {displayChildren && banner}
      </div>
    );
  }
});

export {Sidebar};
