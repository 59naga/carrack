// dependencies
import AsyncEmitter from '../src';

import Promise from 'bluebird';
import assert from 'power-assert';

// specs
describe('carrack', function () {
  this.timeout(500);

  describe('.emit', () => {
    it('values is passed as an array of values from all the listeners', () => {
      const emitter = new AsyncEmitter;
      emitter.once('foo', (data) => {
        return new Promise((resolve) => {
          resolve(data);
        });
      });

      const promise = emitter.emit('foo', 'bar')
      .then(values => {
        assert(values[0] === 'bar');

        return emitter.emit('foo', 'bar');
      })
      .then(values => {
        assert(values[0] === undefined);
      });

      return promise;
    });

    it('discarding all the other promises whether or not they have resolved', () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (data) => {
        return new Promise((resolve) => {
          resolve(data);
        });
      });
      emitter.on('foo', (data) => {
        return new Promise((resolve, reject) => {
          reject(new Error(data));
        });
      });

      const promise = emitter.emit('foo', 'bar').catch(reason => {
        assert(reason instanceof Error);
        assert(reason.message === 'bar');
      });

      return promise;
    });

    it('always the listener should be stopped at the removeListener', () => {
      const listener = () => 1;
      const emitter = new AsyncEmitter;
      emitter.once('foo', listener);
      emitter.removeListener('foo', listener);

      return emitter.emit('foo').then((values) => {
        assert(values[0] === undefined);
      });
    });
  });
});
