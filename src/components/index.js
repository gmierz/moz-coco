/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {Grid, Row, Col, Table} from 'react-bootstrap';

import PageStore from '../stores/PageStore';
import PageActions from '../actions/PageActions';

import {addIndexArray} from '../ReactUtil';
import {Sidebar} from './Sidebar';
import {DiffInfoStore, DiffViewer} from './DiffViewer';
import Loading from './Loading';
import Errors from '../Errors';
import Config from '../Config';

var ErrorReporter = <Errors.ErrorOverlay entry={{error: Errors}} />

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

var CocoPatchDiff = React.createClass({
  getInitialState: function() {
    return {query: null, data: null, loading_diff_data: false};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onLoadingDiff, 'loading_patch_diff')
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onLoadingDiff, 'loading_patch_diff');
  },
  _onLoadingDiff: function() {
    this.setState({data: null, query: null, loading_diff_data: true});
    PageStore.emitChange('loading_bug_info');
    var curr_changeset = PageStore.getChangeset();
    var branch = PageStore.getBranch();
    var prefix_str = "https://hg.mozilla.org/"

    // Needs a file for this to work. Use a file name from
    // coverage data to do this later so that the user doesn't
    // have to input random file names.
    var file_to_find = "taskcluster/ci/test/test-platforms.yml"

    var total_str = prefix_str.concat(branch.concat("/json-diff/".concat(curr_changeset.concat("/".concat(file_to_find)))))
    console.log(total_str)
    var json_file = getJSON(total_str, this._loadedBug);
  },
  _loadedBug: function(err, data) {
    console.log(data);
    PageStore.setBugData(data);
    PageStore.setPatchDiffData("a patch diff");
    PageStore.emitChange('loaded_bug_info');
    PageStore.emitChange('loaded_patch_data');
    this.setState({data: null, query: null, loading_diff_data: false});
  },
  render: function() {
    if (!this.state.loading_diff_data) {
      return (
        <div className="diff_view">
          <DiffInfoStore />
          <DiffViewer />
        </div>
      );
    } else {
      return (
        <div className="diff_view">
          <DiffInfoStore />
          <div className="row loading-bar">
            Processing changeset {PageStore.getChangeset()}... <br></br>
            <img src="icons/8-1.gif"></img>
          </div>
        </div>
      );
    }
  }
});

var PlaceHolderState = React.createClass({
  render: function() {
    return (
      <div>
        <p> Hello World! </p>
      </div>
    );
  }
});


var TopLevel = React.createClass({
  getInitialState: function() {
    return {loading: true};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    PageStore.addChangeListener(this._onStartState, 'cocopatchdiff');
    PageStore.addChangeListener(this._onPlaceHolderState, 'placeholder_change');

    // Check if query parameters are already given through URL.
    // If they are store them as the defaults that should be used.
    var url_string = location;
    var url = new URL(url_string);
    var changeset = url.searchParams.get("changeset");
    console.log(changeset);
    if (changeset) {
      PageStore.setChangeset(changeset);
    }
    var branch = url.searchParams.get("branch");
    console.log(branch);
    if (branch) {
      PageStore.setBranch(branch);
    }

    this.setState({loading: false, start_state:true});
    PageActions.toggleSidebar()
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
    PageStore.removeChangeListener(this._onStartState, 'cocopatchdiff');
    PageStore.removeChangeListener(this._onPlaceHolderState, 'placeholder_change');
  },
  _onChange: function() {
    this.forceUpdate();
  },
  _onStartState: function() {
    this.setState({start_state: true, loading: false, placeholder_state: false});
  },
  _onPlaceHolderState: function() {
    this.setState({start_state: false, loading: false, placeholder_state: true});
  },
  render: function() {
    var classnametxt = "page-wrapper";
    if (PageStore.getCollapsed()) {
      classnametxt += " collapsed";
    }
    if (this.state.loading) {
      return <Loading />;
    } 
    else if (this.state.placeholder_state) {
      return ( 
        <div id="page-wrapper" className={classnametxt}>
          <Sidebar></Sidebar>
          {ErrorReporter}
          <Grid fluid>
          <Row>
          <Col sm={12}>
          <PlaceHolderState />
          </Col>
          </Row>
          </Grid>
        </div>
      );
    }
    else { // Start state
      return ( 
        <div id="page-wrapper" className={classnametxt}>
          <Sidebar></Sidebar>
          {ErrorReporter}
          <Grid fluid>
          <Row>
          <Col sm={12}>
          <CocoPatchDiff />
          </Col>
          </Row>
          </Grid>
        </div>
      );
    }
  }
});

ReactDOM.render(
  <TopLevel />
  , document.getElementById('react-root')
);

