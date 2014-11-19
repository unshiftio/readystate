'use strict';

/**
 * Generate a new prototype method which will the given function once the
 * desired state has been reached. The returned function accepts 2 arguments:
 *
 * - fn: The assigned function which needs to be called.
 * - context: Context/this value of the function we need to execute.
 *
 * @param {String} state The state we need to operate upon.
 * @returns {Function}
 * @api private
 */
function generate(state) {
  return function proxy(fn, context) {
    if (this.is(state)) {
      fn.call(context, this.readyState);
    } else {
      if (!this._events[state]) this._events[state] = [];
      this._events[state].push({ fn: fn, context: context });
    }

    return this;
  };
}

/**
 * RS (readyState) instance.
 *
 * @constructor
 * @api public
 */
function RS() {
  this.readyState = RS.UNKNOWN;
  this._events = {};
}

/**
 * The environment can be in different states. The following states are
 * generated:
 *
 * - ALL:         The I don't really give a fuck state.
 * - UNKNOWN:     We got an unknown readyState we should start listening for events.
 * - LOADING:     Environment is currently loading.
 * - INTERACTIVE: Environment is ready for modification.
 * - COMPLETE:    All resources have been loaded.
 *
 * Please note that the order of the `states` string/array is of vital
 * importance as it's used in the readyState check.
 *
 * @type {Number}
 * @private
 */
RS.states = 'ALL,UNKNOWN,LOADING,INTERACTIVE,COMPLETE'.split(',');

for (var s = 0, state; s < RS.states.length; s++) {
  state = RS.states[s];

  RS[state] = RS.prototype[state] = s;
  RS.prototype[state.toLowerCase()] = generate(state);
}

/**
 * A change in the environment has been detected so we need to change our
 * readyState and call assigned event listeners and those of the previous
 * states.
 *
 * @param {Number} state The new readyState that we detected.
 * @returns {RS}
 * @api private
 */
RS.prototype.change = function change(state) {
  if ('string' === typeof state) state = +RS[state.toUpperCase()] || 0;

  var previously = this.readyState
    , name, i = 0, j, listener;

  if (previously >= state) return this;

  this.readyState = state;

  for (; i < RS.states.length; i++) {
    if (i > state) break;
    name = RS.states[i];

    if (name in this._events) {
      for (j = 0; j < this._events[name].length; j++) {
        listener = this._events[name][j];
        listener.fn.call(listener.context || this, previously);
      }

      delete this._events[name];
    }
  }

  return this;
};

/**
 * Check if we're currently in a given readyState.
 *
 * @param {String|Number} state The required readyState.
 * @returns {Boolean} Indication if this state has been reached.
 * @api public
 */
RS.prototype.is = function is(state) {
  if ('string' === typeof state) state = +RS[state.toUpperCase()] || 0;

  return this.readyState >= state;
};

//
// Expose the module.
//
module.exports = new RS();
