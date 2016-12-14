
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';

var Errors = {
  fatal: "fatal",
  error: "error",
  warn: "warn",
  info: "info",
  console_level: "info",
  modal_level: "warn",
  callback: function(level, message) {
    console.error(`${level}: ${message}`); 
  },
  handleError: function(level, message) {
    const perr = "During a previous error a programmer error"
        + " occurred while processing the previous error";
    if (!this.callback) {
      console.error(`${level}: ${message}`); 
      console.error(perr);
      return;
    }
    if (this.logLevelCheck(level, this.modal_level)) {
      this.callback(this.warn, message);
    }
    if (this.logLevelCheck(level, this.console_level)) {
      console.error(`${level}: ${message}`); 
    }
  },
  logLevelCheck: function(level, set_level) {
    var levels = [this.fatal, this.error, this.warn, this.info];
    return levels.indexOf(level) <= levels.indexOf(set_level);
  },
  ErrorOverlay: React.createClass({
    getInitialState() {
      return { show: false, text: "<test message>", level: this.warn};
    },
    componentDidMount() {
      this.props.entry.error.callback = this.setAndShow;
    },
    setAndShow(level, message) {
      this.setState({text: message, level: level}, this.show);
    },
    show() {
      setTimeout(() => {
        this.setState({ show: false });
      }, 8000);
      this.setState({ show: true });
    },

    render() {
      return (
        <div style={{ height: 0, paddingLeft: 150, position: 'absolute' }}>
        <Overlay show={this.state.show} container={this} target={() => this} placement="bottom">
          <Tooltip id="overload-bottom">{this.state.text}</Tooltip>
        </Overlay>
        </div>
      );
    }
  })
}

module.exports = Errors;
