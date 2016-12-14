
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
          <h4><a href="https://github.com/co60ca/moz-codecover-ui">Github Link / Project Description</a></h4>
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
