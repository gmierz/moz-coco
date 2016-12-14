
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {ProgressBar} from 'react-bootstrap';

var TableHeadData = React.createClass({
  render: function() {
    var items = this.props.data.map((d) => {
      if (typeof(d.val) === "string") {
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
              var col = ci;
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
      <tr onClick={this.props.onCellClick.bind(this)}>
        {items}
      </tr>
    );
  }
});

export {TableRowData, TableHeadData};
