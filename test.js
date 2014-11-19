describe('readystate', function () {
  'use strict';

  var assume = require('assume')
    , readystate = require('./readystate')
    , RS = readystate.constructor;

  beforeEach(function () {
    readystate = new RS();
  });

  it('exposes a readyState property', function () {
    assume(readystate.readyState).equals(RS.UNKNOWN);
  });

  describe('#change', function () {
    it('allows strings to set the readyState', function () {
      readystate.change('complete');
      assume(readystate.readyState).equals(RS.COMPLETE);
    });

    it('allows strings to set the readyState', function () {
      readystate.change(RS.LOADING);
      assume(readystate.readyState).equals(RS.LOADING);
    });

    it('only allows changing if its a new readystate', function () {
      readystate.change(RS.LOADING);
      assume(readystate.readyState).equals(RS.LOADING);

      readystate.change(RS.UNKNOWN);
      assume(readystate.readyState).equals(RS.LOADING);
    });

    it('accepts random unknown states', function () {
      assume(readystate.readyState).equals(RS.UNKNOWN);

      readystate.change('foo bar banana');
      assume(readystate.readyState).equals(RS.UNKNOWN);
    });

    it('executes the assigned event listeners', function (next) {
      readystate.complete(function (previous) {
        assume(previous).equals(RS.UNKNOWN);

        next();
      });

      readystate.change('complete');
    });

    it('executes lower level event emitters', function (next) {
      readystate.loading(function () {
        next();
      });

      readystate.change('complete');
    });

    it('calls multiple event listeners', function (next) {
      var pattern = '';

      readystate.loading(function () { pattern = 'a'; });
      readystate.loading(function () {
        assume(pattern).equals('a');

        next();
      });

      readystate.change('loading');
    });
  });

  RS.states.filter(function (state) {
    return RS[state] > RS.UNKNOWN;
  }).forEach(function (state) {
    state = state.toLowerCase();

    describe('#'+ state, function () {
      it('calls the event listener when the event is triggered', function (next) {
        readystate[state](function changed() {
          next();
        });

        readystate.change(state);
      });

      it('call the function when the state is already set', function (next) {
        readystate.change(state);
        readystate[state](function changed() {
          next();
        });
      });

      it('call the function when the state is greater', function (next) {
        readystate.change('complete');
        readystate[state](function changed() {
          next();
        });
      });
    });
  });

  describe('#is', function () {
    it('is a function', function () {
      assume(readystate.is).is.a('function');
    });

    it('always returns `true` for the all mode', function () {
      assume(readystate.is(readystate.ALL)).is.true();
      assume(readystate.is('all')).is.true();
    });

    it('returns false for future ready states', function () {
      assume(readystate.is('complete')).is.false();

      readystate.change('complete');
      assume(readystate.is('complete')).is.true();
    });
  });
});