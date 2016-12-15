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


var TopLevel = React.createClass({
  getInitialState: function() {
    return {loading: true};
  },
  componentWillMount: function() {
    PageStore.addChangeListener(this._onChange);
    // Get latest query
    Client.makeRequest('activedata.allizom.org', {
      "from":"coverage-summary",
      "limit":10,
      "groupby":["build.date","build.revision12"]
    },
    (data) => {
      //TODO(brad) this needs to be sorted by build.date not count
      PageActions.setRevision(data.data[0][1]);
      this.setState({loading: false});

      if (Config.DEVON) {
        Errors.handleError(Errors.warn, "Coco Development mode is currently on,"
          + " this is not a final project and should be expected to have no"
          + " reliability");
      }
    });
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
    if (this.state.loading) {
      return <Loading />;
    } else {
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
  }
});      
ReactDOM.render(
  <TopLevel />
  , document.getElementById('react-root')
);

