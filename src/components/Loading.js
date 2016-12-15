/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

var Loading = React.createClass({
  getInitialState: function() {
    return {hidden: true};
  },
  componentDidMount: function() {
    setTimeout(() => {
      this.setState({hidden: false});
    }, 5);
    setTimeout(() => {
      this.setState({hidden: true});
    }, 1200);
    setTimeout(() => {
      this.props.then();
    }, 2400);
  },
  render: function() {
    var props = {}
    props.style = {"opacity": this.state.hidden ? 0 : 1};
    return (
      <div className="loading-screen">
        <h2 {...props}>
          Coco is loading!<br/>
          <img src="icons/gears.svg"/>
        </h2>
      </div>
    );
  }
});

export default Loading;
