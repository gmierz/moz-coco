
import Errors from './Errors';

function addIndexArray(li) {
  if (!Array.isArray(li)) {
    var error = `Programmers error, ${li} is not array`
    Errors.handlerError(Errors.fatal, error);
    throw error;
  }
  var i = 0;
  return li.map(function(l) {
    i++;
    return {"id": i, "val": l};
  });
}

export default addIndexArray;
