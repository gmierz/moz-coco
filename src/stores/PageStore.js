/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

import AppDispatcher from '../dispatcher/AppDispatcher';
import PageConstants from '../constants/PageConstants';
import {EventEmitter} from 'events';
import keyMirror from 'keymirror';


const CHANGE_EVENT = 'change';
const QUERY_EVENT = 'query';
const DRILL_EVENT = 'drill';

var _selected = null;
var _context = null;
var _revision = null;
var _pages = {};
var _current_page = 0;
var _id_incrementor = 0;
var _sidebar_collapsed = false;

/* PageStore contains and dispatches update events when actions are run
 * this allows multiple components to listen for changes
 */

function createPage(title, query) {
  var id = _id_incrementor;
  _pages[id] = {
    id: id,
    title: title,
    query: query
  };
  _id_incrementor++;
}

function switchPage(id) {
  if (id in _pages) {
    _current_page = id;
  }
  setContext(null);
  setSelected(null);
}

function toggle_sidebar() {
  _sidebar_collapsed = !_sidebar_collapsed;
}

function updateQuery(q) {
  _selected_query = q;
}

function setContext(q) {
  _context = q;
  PageStore.emitChange(DRILL_EVENT);
}

function setSelected(q) {
  _selected = q;
}

function setRevision(q) {
  _revision = q;
}

var PageStore = Object.assign({}, EventEmitter.prototype, {
  
  getQuery: function() {
    return _pages[_current_page].query;
  },

  getAll: function() {
    return _pages;
  },

  getCollapsed: function() {
    return _sidebar_collapsed;
  },

  getContext: function() {
    return _context;
  },
  
  getSelected: function() {
    return _selected;
  },
  
  getRevision: function() {
    return _revision;
  },

  emitChange: function(evnt = CHANGE_EVENT) {
    this.emit(evnt);
  },

  addChangeListener: function(callback, type=CHANGE_EVENT) {
    this.on(type, callback);
  },

  removeChangeListener: function(callback, type=CHANGE_EVENT) {
    this.removeListener(type, callback);
  }
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case PageConstants.PAGE_ADD:
      createPage(action.title, action.query);
      PageStore.emitChange();
      break;
    case PageConstants.PAGE_CHANGE:
      switchPage(action.id);
      PageStore.emitChange(QUERY_EVENT);
      break;
    case PageConstants.SIDEBAR_TOGGLE:
      toggle_sidebar();
      PageStore.emitChange();
      break;
    case PageConstants.UPDATE_QUERY:
      updateQuery();
      PageStore.emitChange(QUERY_EVENT);
      break;
    case PageConstants.SET_CONTEXT:
      setContext(action.set);
      // Don't emit to prevent loops
      // Emitter moved to setContext
      break;
    case PageConstants.SET_SELECTED:
      setSelected(action.set);
      PageStore.emitChange(QUERY_EVENT);
      break; 
    case PageConstants.SET_REVISION:
      setRevision(action.set);
      PageStore.emitChange(QUERY_EVENT);
      break;
    default:
  }
});

module.exports = PageStore;
