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
  }
};

module.exports = PageActions;
