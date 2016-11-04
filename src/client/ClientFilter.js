
// Internal function for recursion
function setProp(queryJSON, prop, val) {
  if(queryJSON.hasOwnProperty(prop)) {
    queryJSON[prop] = val;
    return true;  
  }
  for (var key in queryJSON) {
    if (typeof queryJSON[key] === 'object' &&
        setProp(queryJSON[key], prop, val)) {
      return true;
    }    
  }
  return false;
}

// Top level function to start recursion
function setRevision(queryJSON, revision) {
  return setProp(queryJSON.where, 'build.revision12', revision);
}

module.exports = {setRevision: setRevision, setProp: setProp};
