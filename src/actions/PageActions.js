/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/
var AppDispatcher = require('../dispatcher/AppDispatcher');
var PageConstants = require('../constants/PageConstants');


/* PageActions provides actions that can opperate on the 
 * PageStore
 */
var PageActions = {
  create: function(title, query) {
    AppDispatcher.dispatch({
      actionType: PageConstants.PAGE_ADD,
      title: title,
      query: query
    });
  },

  change: function(id) {
    AppDispatcher.dispatch({
      actionType: PageConstants.PAGE_CHANGE,
      id: id
    });
  },

  toggleSidebar: function() {
    AppDispatcher.dispatch({
      actionType: PageConstants.SIDEBAR_TOGGLE,
    });
  },

  setContext: function(q) {
    AppDispatcher.dispatch({
      actionType: PageConstants.SET_CONTEXT,
      set: q
    });
  },

  setSelected: function(q) {
    AppDispatcher.dispatch({
      actionType: PageConstants.SET_SELECTED,
      set: q
    });
  } 

};

module.exports = PageActions;
