// dependencies
import { EventEmitter } from 'events';
import Promise from 'bluebird';

// @class AsyncEmitter
export default class AsyncEmitter extends EventEmitter {
  /**
  * run the listener as Promise
  *
  * @method executeListener
  * @param {function} listener - a code block
  * @param {any[]} args - a event arguments
  * @returns {promise} - the return value or exception
  */
  executeListener(listener, args) {
    try {
      return Promise.resolve(listener(...args));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
  * run the listeners in parallel
  *
  * @method emitParallel
  * @alias emit
  * @param {string} event - a event name
  * @param {any} arguments - a arguments pass to listeners
  * @returns {promise<any>} - the return value of listeners
  */
  emitParallel(event, ...args) {
    const promises = [];

    this.listeners(event).forEach(listener => {
      promises.push(this.executeListener(listener, args));
    });

    return Promise.all(promises);
  }

  /**
  * run the listeners in serial
  *
  * @method emitSerial
  * @param {string} event - a event name
  * @param {any} arguments - a arguments pass to listeners
  * @returns {promise<any>} - the return value of listeners
  */
  emitSerial(event, ...args) {
    return this.listeners(event).reduce(
      (promise, listener) => promise.then((values) =>
        this.executeListener(listener, args).then(
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
  * run the listeners in serial using previous listener return value
  *
  * @method emitReduce
  * @param {string} event - a event name
  * @param {any} arguments - a arguments pass to listeners
  * @returns {promise<any>} - the return value of listeners
  */
  emitReduce(event, ...args) {
    return this.emitReduceRun(false, event, args);
  }

  /**
  * run the listeners in serial and in inverse using previous listener return value
  *
  * @method emitReduceRight
  * @param {string} event - a event name
  * @param {any} arguments - a arguments pass to listeners
  * @returns {promise<any>} - the return value of listeners
  */
  emitReduceRight(event, ...args) {
    return this.emitReduceRun(true, event, args);
  }

  /**
  * emitReduce/emitReduceRight common processing
  *
  * @method emitReduceRun
  * @param {boolean} inverse - if true, execute listner in inverse
  * @param {string} event - a event name
  * @param {any[]} args - a arguments pass to first listener
  * @returns {any[]} values - the return value of last listener
  */
  emitReduceRun(inverse, event, args) {
    const listeners = inverse ? this.listeners(event).reverse() : this.listeners(event);
    return listeners.reduce(
      (promise, listener) => promise.then((prevArgs) => {
        const currentArgs = prevArgs instanceof Array ? prevArgs : [prevArgs];
        return this.executeListener(listener, currentArgs);
      }),
      Promise.resolve(args),
    );
  }

  /**
  * emit a 'removeListener' event iff the listener was removed
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
