// dependencies
import 'babel-polyfill';
import Promise from 'bluebird';
import assert from 'power-assert';
import { throws, rejects } from 'assert-exception';

// target
import AsyncEmitter from '../src';

// specs
describe('carrack', () => {
  describe('.emit / .emitParallel', () => {
    it('should receive the return value of listeners asynchronously', async () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (action) => action);
      emitter.on('foo', (action) => new Promise((resolve) => {
        setTimeout(() => resolve(action));
      }));

      const values = await emitter.emit('foo', 'bar');
      assert(values.length === 2);
      assert(values[0] === 'bar');
      assert(values[1] === 'bar');
    });

    it('if an exception occurs, it should throw an exception only the first one', async () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (action) => action);
      emitter.on('foo', () => new Promise(() => {
        throw new Error('beep');
      }));
      emitter.on('foo', () => Promise.reject(new Error('boop')));

      assert((await rejects(emitter.emit('foo', 'bar'))).message === 'beep');
    });

    it('if the promise was rejected, it should throw only the first of the reject', async () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (action) => action);
      emitter.on('foo', () => Promise.reject(new Error('boop')));
      emitter.on('foo', () => new Promise(() => {
        throw new Error('beep');
      }));

      assert((await rejects(emitter.emit('foo', 'bar'))).message === 'boop');
    });
  });

  describe('.emitSerial', () => {
    it('listener should be run serially', async () => {
      const delay = 100;
      const emitter = new AsyncEmitter;
      emitter.on('delay', (ms) => new Promise(resolve => {
        setTimeout(() => resolve(Date.now()), ms);
      }));
      emitter.on('delay', (ms) => new Promise(resolve => {
        setTimeout(() => resolve(Date.now()), ms);
      }));
      emitter.on('delay', (ms) => new Promise(resolve => {
        setTimeout(() => resolve(Date.now()), ms);
      }));

      const values = await emitter.emitSerial('delay', delay);
      assert(values[1] - values[0] >= delay);
      assert(values[2] - values[1] >= delay);
    });

    it('if an exception occurs, it should throw an exception only the first one', async () => {
      const delay = 100;
      const emitter = new AsyncEmitter;
      emitter.on('delay', (ms) => new Promise(resolve => {
        setTimeout(() => resolve(Date.now()), ms);
      }));
      emitter.on('delay', (ms) => new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('foo')), ms);
      }));
      emitter.on('delay', (ms) => new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('bar')), ms);
      }));

      const reason = await rejects(emitter.emitSerial('delay', delay));
      assert(reason.message === 'foo');
    });
  });

  describe('.once', () => {
    it('listeners that have been executed should be removed immediately', async () => {
      const emitter = new AsyncEmitter;
      emitter.once('foo', (action) => action);

      let values;
      values = await emitter.emit('foo', 'bar');
      assert(values.length === 1);
      assert(values[0] === 'bar');

      values = await emitter.emit('foo', 'bar');
      assert(values.length === 0);
      assert(values[0] === undefined);
    });

    it("if the argument isn't function, should throw an exception", () => {
      const emitter = new AsyncEmitter;
      assert(throws(() => {
        emitter.once('foo', 'bad argument!');
      }).message === 'listener must be a function');
    });
  });

  describe('.subscribe', () => {
    it('if executed the return value, should remove the listener', async () => {
      const emitter = new AsyncEmitter;
      const unsubcribe = emitter.subscribe('foo', (action) => action);

      let values;
      values = await emitter.emit('foo', 'bar');
      assert(values.length === 1);
      assert(values[0] === 'bar');

      unsubcribe();

      values = await emitter.emit('foo', 'bar');
      assert(values.length === 0);
      assert(values[0] === undefined);
    });

    it('if specify third argument is true, should remove the listener after executed', async () => {
      const emitter = new AsyncEmitter;

      const unsubscribe = emitter.subscribe('foo', (action) => action, true);
      unsubscribe();

      emitter.subscribe('foo', (action) => action, true);
      let values;
      values = await emitter.emit('foo', 'bar');
      assert(values.length === 1);
      assert(values[0] === 'bar');

      values = await emitter.emit('foo', 'bar');
      assert(values.length === 0);
      assert(values[0] === undefined);
    });
  });

  describe('issues (regression test)', () => {
    describe('.once', () => {
      it('#3: always the listener should be stopped at the removeListener', async () => {
        const listener = () => 1;
        const emitter = new AsyncEmitter;
        emitter.once('foo', listener);
        emitter.removeListener('foo', listener);

        const values = await emitter.emit('foo');
        assert(values.length === 0);
        assert(values[0] === undefined);
      });
    });
    describe('.emitSerial', () => {
      it('#4: should not be destroying a listener for the return values', async () => {
        const delay = 100;
        const emitter = new AsyncEmitter;
        emitter.on('delay', () => [1]);
        emitter.on('delay', () => [2]);

        const values = await emitter.emitSerial('delay', delay);
        assert(values[0][0] === 1);
        assert(values[1][0] === 2);
      });
    });
  });
});
