
/*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/.
*
* Author: Bradley Kennedy (bk@co60.ca)
*/

var keyMirror = require('keymirror');

/* 
 * This provides the names of the various actions that
 * can occur
 */

module.exports = keyMirror({
  PAGE_ADD: null,
  PAGE_CHANGE: null,
  SIDEBAR_TOGGLE: null,
  UPDATE_QUERY: null,
  SET_CONTEXT: null,
  SET_SELECTED: null,
});
