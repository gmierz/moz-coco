
import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Modal} from 'react-bootstrap';

const Example = React.createClass({
  getInitialState() {
    return { showModal: false };
  },
  close() {
    this.setState({ showModal: false });
  },
  open() {
    this.setState({ showModal: true });
  },
  render() {
    return (
      <div>
      <Button bsSize="small" style={{marginTop: "10px"}} onClick={this.open} >
        Info
      </Button>

      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>Coco Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Coco</h3>
          <b>Co</b>de <b>co</b>verage data exploration tool
          <h4>
            <a href="https://github.com/co60ca/moz-codecover-ui">Github Link / Project Description</a>
          </h4>
          <h3>Winter 2017 Fork</h3>
          <h4>
            <a href="https://github.com/ericdesj/moz-codecover-ui">Github Link / Project Description</a>
          </h4>
          <h4>
            <a href="https://github.com/ericdesj/moz-codecover-ui/issues">Create GitHub Issue</a>
          </h4>
          <hr/>
          <h3>Legend</h3>
          <hr/>
          <h4>Drilldown enabled</h4>
          <p>
          <img src="icons/drill.png" height="32px"/>
          <br/>
          The specified query has drilldown features enabled on it.
          When using this query clicking a row will drill down a level.
          </p>
          <h4>Revision Setting enabled</h4>
          <p>
          <img src="icons/rev.png" height="32px"/>
          <br/>
          The specified query allows changing of the revision number to filter
          on.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}>Close</Button>
        </Modal.Footer>
      </Modal>
      </div>
    );
  }
});

module.exports = Example;
