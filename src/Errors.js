
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var React = require('react');
var Overlay = require('react-bootstrap/lib/Overlay');
var Tooltip = require('react-bootstrap/lib/Tooltip');

var Errors = {
  fatal: "fatal",
  error: "error",
  warn: "warn",
  info: "info",
  callback: function(level, message) {
    console.log(`${level}: ${message}`); 
  },
  handleError: function(level, message) {
    var perr = "During a previous error a programmer error"
        + " occurred while processing the previous error";
    if (!this.callback) {
      console.log(`${level}: ${message}`); 
      console.log(perr);
      return;
    }
    if (!this.hasOwnProperty(level) || !(typeof this[level] === 'string')) {
      this.callback(this.warn, message);
      this.callback(this.warn, perr);
      return;
    }
    this.callback(level, message);
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
