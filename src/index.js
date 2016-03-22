// dependencies
import { EventEmitter } from 'events';
import Promise from 'bluebird';

// @class AsyncEmitter
export default class AsyncEmitter extends EventEmitter {
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
  emit(event, ...args) {
    const promises = [];

    this.listeners(event).forEach(listener => {
      promises.push(listener(...args));
    });

    return Promise.all(promises);
  }
}
