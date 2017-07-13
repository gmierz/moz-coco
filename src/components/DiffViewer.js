/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {Button, Nav, NavItem, MenuItem, NavDropdown, ControlLabel, PageHeader,
FormControl, InputGroup, FormGroup, ButtonToolbar, DropdownButton, TextInput} from 'react-bootstrap';

import PageStore from '../stores/PageStore';
import PageActions from '../actions/PageActions';

import Client from '../client/Client';
import ClientFilter from '../client/ClientFilter';


var DiffInfoStore = React.createClass({
  getInitialState: function() {
    return {query: null, data: null, changeset: PageStore.getChangeset()};
  },
  componentWillMount: function() {
    if (!PageStore.getRevision()) {
      PageActions.setRevision("d19d1d2136bb");
    }
    //this.sendQuery();
    PageStore.addChangeListener(this._onChange, 'query');
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange, 'query');
  },
  _onChange: function(e) {
    this.setState({data: null, query: null, changeset: PageStore.getChangeset()}, this.sendQuery);
  },
  _onInput: function(event) {
    PageStore.setChangeset(event.target.value);
    this.setState({data: null, query: null, changeset: event.target.value})
  },
  getValidationState: function() {
    const length = this.state.changeset.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
  },
  render: function() {
    return (
      <div>
        <div>
        <PageHeader>Coverage Patch Diff Tool</PageHeader>
        </div>
        <div>
        <form>
          <FormGroup controlId="changesetForm" validationState={this.getValidationState()}>
            <ControlLabel>Select Changeset</ControlLabel>
            <FormControl onChange={this._onInput} value={this.state.changeset} placeholder="Enter changeset">
            </FormControl>
            <FormControl.Feedback />
          </FormGroup>
        </form>
        </div> 
        <Button onClick={function () {
          PageStore.emitChange('loading_patch_diff');
        }}>
          <i className="fa fa-bars" aria-hidden="false" ></i> Emit Change
        </Button>
      </div>
    );
  }
});

var DiffViewer = React.createClass({
  getInitialState: function() {
    return {loading_information: false, information: null};
  },
  componentWillMount: function() {
    if (!PageStore.getRevision()) {
      PageActions.setRevision("d19d1d2136bb");
    }
    //this.sendQuery();
    PageStore.addChangeListener(this._onChange, 'query');
    PageStore.addChangeListener(this._onChange, 'getting_data');
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange, 'query');
    PageStore.removeChangeListener(this._onChange, 'getting_data');
  },
  _onChange: function(e) {
    this.setState({loading_information: false, information: null});
  },
  _onChange: function(e) {
    this.setState({loading_information: false, information: null});
  },
  render: function() {
    return (
      <div>
        <p>
        {PageStore.getChangeset()}
        </p>
      </div>
    );
  }
});

export {DiffInfoStore, DiffViewer};
