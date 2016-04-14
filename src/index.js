// dependencies
import { EventEmitter } from 'events';
import Promise from 'bluebird';

// @class AsyncEmitter
export default class AsyncEmitter extends EventEmitter {
  /**
  * run the listener in parallel
  *
  * @method emitParallel
  * @alias emit
  * @param {string} event - a event name
  * @param {any} arguments - a arguments pass to listeners
  * @returns {promise<any>} - the return value of listeners
  */
  emit(...args) {
    return this.emitParallel(...args);
  }
  emitParallel(event, ...args) {
    const promises = [];

    this.listeners(event).forEach(listener => {
      promises.push(listener(...args));
    });

    return Promise.all(promises);
  }

  /**
  * run the listener in serial
  *
  * @method emitSerial
  * @param {string} event - a event name
  * @param {any} arguments - a arguments pass to listeners
  * @returns {promise<any>} - the return value of listeners
  */
  emitSerial(event, ...args) {
    return this.listeners(event).reduce(
      (promise, listener) => promise.then((values) =>
        Promise.resolve(listener(...args)).then(
          (value) => {
            values.push(value);
            return values;
          },
        )
      ),
      Promise.resolve([]),
    );
  }

  /**
  * emits a 'removeListener' event iff the listener was removed
  * (redefine for inherited method doesn't work)
  *
  * @method once
  * @param {string} event - a event name
  * @param {function} listener - a listener function
  * @returns {asyncEmitter} this
  */
  once(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    let fired = false;
    const onceListener = (...args) => {
      this.removeListener(event, onceListener);

      if (fired === false) {
        fired = true;
        return listener(...args);
      }
      return undefined;
    };

    // https://github.com/nodejs/node/blob/v4.1.2/lib/events.js#L286
    onceListener.listener = listener;
    this.on(event, onceListener);

    return this;
  }

  /**
  * register an event listener, returns the remove function
  *
  * @method subscribe
  * @param {string} event - a event name
  * @param {function} listener - a listener function
  * @param {boolean} [once=false] - if true, listener is call only once
  * @returns {function} unsubscribe - the remove function of listener
  */
  subscribe(event, listener, once = false) {
    const unsubscribe = () => {
      this.removeListener(event, listener);
    };

    if (once) {
      this.once(event, listener);
    } else {
      this.on(event, listener);
    }

    return unsubscribe;
  }
}
