/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {Button, Nav, NavItem, MenuItem, NavDropdown, ControlLabel, PageHeader, ListGroup, ListGroupItem,
FormControl, InputGroup, FormGroup, ButtonToolbar, DropdownButton, TextInput, HelpBlock, SplitButton,
Form} from 'react-bootstrap';

import PageStore from '../stores/PageStore';
import PageActions from '../actions/PageActions';

import Client from '../client/Client';
import ClientFilter from '../client/ClientFilter';


var DiffInfoStore = React.createClass({
  getInitialState: function() {
    return {loaded_bug_info: false, data: null, changeset: PageStore.getChangeset(), branch: PageStore.getBranch()};
  },
  componentWillMount: function() {
    if (!PageStore.getRevision()) {
      PageActions.setRevision("d19d1d2136bb");
    }
    //this.sendQuery();
    PageStore.addChangeListener(this._onDataLoading, 'loading_bug_info');
    PageStore.addChangeListener(this._onDataLoad, 'loaded_bug_info');
  },
  componentWillUnmount: function() {
    this.setState({loaded_bug_info: false, data: null, changeset: PageStore.getChangeset()});
    PageStore.removeChangeListener(this._onDataLoading, 'loading_bug_info');
    PageStore.removeChangeListener(this._onDataLoad, 'loaded_bug_info');
  },
  _onInput: function(event) {
    PageStore.setChangeset(event.target.value);
    this.setState({loaded_bug_info: this.state.loaded_bug_info, data: null, changeset: event.target.value})
  },
  _onDataLoad: function() {
    this.setState({loaded_bug_info: true, data: PageStore.getBugData(), changeset: this.state.changeset});
  },
  _onDataLoading: function() {
    this.setState({loaded_bug_info: false, data: null, changeset: this.state.changeset});
  },
  _onBranchPick: function(event) {
    this.setState({branch: event.target.value});
    PageStore.setBranch(event.target.value);
  },
  getValidationState: function() {
    const length = this.state.changeset.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
  },
  render: function() {
    var loaded_bug_info = this.state.loaded_bug_info

    var author = "";
    var bug_desc = "";
    var treeherder_link = "";
    var hg_link = "";
    if (loaded_bug_info) {
      var bug_data = PageStore.getBugData();
      author = bug_data["author"];
      bug_desc = bug_data["desc"];

      var branch = PageStore.getBranch();
      treeherder_link = "https://treeherder.mozilla.org/#/jobs?repo=" + branch + "&revision=" + this.state.changeset;
      hg_link = "https://hg.mozilla.org/" + branch + "/rev/" + this.state.changeset;
    }

    return (
      <div>
        <div>
        <PageHeader>Coverage Patch Diff Tool</PageHeader>
        </div>
        <div>
        <Form horizontal>
          <FormGroup controlId="changesetForm" validationState={this.getValidationState()}>
            <ControlLabel>Select Changeset</ControlLabel>
            <FormControl onChange={this._onInput} value={this.state.changeset} placeholder="Enter changeset">
            </FormControl>
            <FormControl.Feedback />
            <HelpBlock>Changing this field after getting results will cause you to lose everything that was generated. </HelpBlock>

            <ControlLabel>Select a Branch</ControlLabel>
            <FormControl onChange={this._onBranchPick} value={this.state.branch} componentClass="select" style={{maxWidth: '' + 50 + '%'}}>
              <option value="mozilla-central">mozilla-central</option>
              <option value="beta">beta</option>
              <option value="try">try</option>
            </FormControl>
          </FormGroup>
          <FormGroup>

          </FormGroup>
        </Form>
        </div> 
        <Button onClick={function () {
          PageStore.emitChange('loading_patch_diff');
        }}>
          <i className="fa fa-bars" aria-hidden="false" ></i> Check Changeset
        </Button>
        <br>
        </br>
        {loaded_bug_info &&
          <div>
            <h3> Bug Information </h3>
            <ListGroup>
              <ListGroupItem header="Author">{author}</ListGroupItem>
              <ListGroupItem header="Bug Description">{bug_desc}</ListGroupItem>
              <ListGroupItem header="Treeherder Link" href={treeherder_link}></ListGroupItem>
              <ListGroupItem header="Hg Repository Link" href={hg_link}></ListGroupItem>
            </ListGroup>
          </div>
        }
      </div>
    );
  }
});

var DiffViewer = React.createClass({
  getInitialState: function() {
    return {loading_information: false, information: PageStore.getPatchDiffData()};
  },
  componentWillMount: function() {
    if (!PageStore.getRevision()) {
      PageActions.setRevision("d19d1d2136bb");
    }
    //this.sendQuery();
    PageStore.addChangeListener(this._onChange, 'query');
    PageStore.addChangeListener(this._onDataChange, 'loaded_patch_data');
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange, 'query');
    PageStore.removeChangeListener(this._onDataChange, 'loaded_patch_data');
  },
  _onChange: function(e) {
    this.setState({loading_information: false, information: null});
  },
  _onDataChange: function(e) {
    this.setState({loading_information: false, information: PageStore.getPatchDiffData()});
  },
  render: function() {
    if (this.state.information) {
      return (
        <div>
          <br>
          </br>
          <h3> Patch Diff </h3>
          <p>
          {PageStore.getChangeset()}
          </p>
        </div>
      );
    }
    else {
      return (
        <div>
          <br>
          </br>
          <p> Set a changeset and hit that button! </p>
        </div>
      );
    }
  }
});

export {DiffInfoStore, DiffViewer};
