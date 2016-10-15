var AppDispatcher = require('../dispatcher/AppDispatcher');
var PageConstants = require('../constants/PageConstants');
var EventEmitter = require('events').EventEmitter;
var keyMirror = require('keymirror');


var CHANGE_EVENT = 'change';
var QUERY_EVENT = 'query';

var _pages = {};
var _current_page = 0;
var _id_incrementor = 0;
var _sidebar_collapsed = false;

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
    _current_page = id
  }
}

function toggle_sidebar() {
  _sidebar_collapsed = !_sidebar_collapsed;
}

function updateQuery(q) {
  _selected_query = q;
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
      
    default:
  }
});

module.exports = PageStore;



