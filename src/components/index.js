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

import Client from '../client/Client';
import ClientFilter from '../client/ClientFilter';

import {addIndexArray} from '../ReactUtil';
import {TableRowData, TableHeadData} from './Tables';
import {Sidebar, NavOptions} from './Sidebar';
import {DiffInfoStore, DiffViewer} from './DiffViewer';
import Loading from './Loading';
import Errors from '../Errors';
import Config from '../Config';

var ErrorReporter = <Errors.ErrorOverlay entry={{error: Errors}} />

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
        if (this.state.query.processPre) {
          this.state.query.processPre(this, data);
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
      var onCellClick = function(event) {
        PageActions.setSelected(this.props.data.rows);
      }
      if (this.state.query.format_headers) {
        return <TableRowData drill_down={drill_down} key={row.id}
          onCellClick={onCellClick}
          data={{headers: headers, rows: addIndexArray(row.val), }} />
      } else { 
        return <TableRowData drill_down={drill_down} key={row.id} 
          onCellClick={onCellClick}
          data={{ rows: addIndexArray(row.val), }} />
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
    if (!PageStore.getRevision()) {
      PageActions.setRevision("d19d1d2136bb");
    }
    //this.sendQuery();
    PageStore.addChangeListener(this._onChange, 'query');
    PageStore.addChangeListener(this._onLoadingDiff, 'loading_patch_diff')
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange, 'query');
    PageStore.removeChangeListener(this._onLoadingDiff, 'loading_patch_diff');
  },
  _onChange: function(e) {
    this.setState({data: null, query: null, loading_diff_data: false});
  },
  _onLoadingDiff: function() {
    this.setState({data: null, query: null, loading_diff_data: true});
    var curr_changeset = PageStore.getChangeset();
    var branch = PageStore.getBranch();
    var prefix_str = "https://hg.mozilla.org/"
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


var TopLevel = React.createClass({
  getInitialState: function() {
    return {loading: true};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    PageStore.addChangeListener(this._onStartState, 'cocopatchdiff');
    PageStore.addChangeListener(this._onCocoTableState, 'cocotable');
    // Get latest revision query (last two months)
    Client.makeRequest('activedata.allizom.org', {
      "sort":{"build.date":"desc"},
      "from":"coverage-summary",
      "limit":1000,
      "groupby":["build.date","build.revision12","source.language"],
      "where":{"gte":{"build.date":{"date":"today-2month"}}},
      "format":"list"
    },
    (data) => {
      
      PageActions.setRevision(data.data[0].build.revision12);

      var revision_list = [];
      for (var i in data.data) {
        revision_list.push(data.data[i])
      };
      PageActions.setRevisionList(revision_list);

      this.setState({loading: false});

      if (Config.DEVON) {
        Errors.handleError(Errors.warn, "Coco Development mode is currently on,"
          + " this is not a final project and should be expected to have no"
          + " reliability");
      }
      
      this.setState({loading: false, start_state:true});
    });
  },
  componentWillUnmount: function() {
    PageStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.forceUpdate();
  },
  _onStartState: function() {
    this.setState({start_state: true, loading: false, cocotable_state: false});
  },
  _onCocoTableState: function() {
    PageStore.emitChange('sidebar_change');
    this.setState({start_state: false, loading: false, cocotable_state: true});
  },
  render: function() {
    var classnametxt = "page-wrapper";
    if (PageStore.getCollapsed()) {
      classnametxt += " collapsed";
    }
    if (this.state.loading) {
      return <Loading />;
    } else if (this.state.cocotable_state) {
      return ( 
        <div id="page-wrapper" className={classnametxt}>
          <Sidebar><NavOptions/></Sidebar>
          {ErrorReporter}
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
    else {
      return ( 
        <div id="page-wrapper" className={classnametxt}>
          <Sidebar><NavOptions/></Sidebar>
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

