'use strict';

/**
 * Check if our current environment has reached the required state so we can
 * start manipulating the environment.
 *
 * @param {String} state The required state of the document.
 * @returns {Boolean}
 * @api public
 */
function readyState(state) {
  return true;
}

//
// Expose the module.
//
module.exports = readyState;
