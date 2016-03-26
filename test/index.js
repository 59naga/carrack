// dependencies
import Promise from 'bluebird';
import assert from 'power-assert';
import assertRejected from 'assert-rejected';

// target
import AsyncEmitter from '../src';

// specs
describe('carrack', () => {
  describe('.emit', () => {
    it('should receive the return value of listeners asynchronously', () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (action) => action);
      emitter.on('foo', (action) => new Promise((resolve) => {
        setTimeout(() => resolve(action));
      }));

      return emitter.emit('foo', 'bar').then((values) => {
        assert(values.length === 2);
        assert(values[0] === 'bar');
        assert(values[1] === 'bar');
      });
    });

    it('if an exception occurs, it should throw an exception only the first one', () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (action) => action);
      emitter.on('foo', () => new Promise(() => {
        throw new Error('kaboom');
      }));
      emitter.on('foo', () => Promise.reject(new Error('kabo?')));

      return assertRejected(emitter.emit('foo', 'bar'), 'kaboom');
    });

    it('if the promise was rejected, it should throw only the first of the reject', () => {
      const emitter = new AsyncEmitter;
      emitter.on('foo', (action) => action);
      emitter.on('foo', () => Promise.reject(new Error('kabo?')));
      emitter.on('foo', () => new Promise(() => {
        throw new Error('kaboom');
      }));

      return assertRejected(emitter.emit('foo', 'bar'), 'kabo?');
    });
  });

  describe('.once', () => {
    it('listeners that have been executed should be removed immediately', () => {
      const emitter = new AsyncEmitter;
      emitter.once('foo', (action) => action);

      return emitter.emit('foo', 'bar')
      .then((values) => {
        assert(values.length === 1);
        assert(values[0] === 'bar');

        return emitter.emit('foo', 'bar');
      })
      .then((values) => {
        assert(values.length === 0);
        assert(values[0] === undefined);
      });
    });

    it("if the argument isn't function, should throw an exception", () => {
      const emitter = new AsyncEmitter;
      assert.throws(
        () => {
          emitter.once('foo', 'bad argument!');
        },
        (error) => {
          assert(error.message === 'listener must be a function');
          return true;
        }
      );
    });
  });

  describe('.subscribe', () => {
    it('if executed the return value, should remove the listener', () => {
      const emitter = new AsyncEmitter;
      const unsubcribe = emitter.subscribe('foo', (action) => action);

      return emitter.emit('foo', 'bar')
      .then((values) => {
        assert(values.length === 1);
        assert(values[0] === 'bar');

        unsubcribe();

        return emitter.emit('foo', 'bar');
      })
      .then((values) => {
        assert(values.length === 0);
        assert(values[0] === undefined);
      });
    });

    it('if specify third argument is true, should remove the listener after executed', () => {
      const emitter = new AsyncEmitter;

      const unsubscribe = emitter.subscribe('foo', (action) => action, true);
      unsubscribe();

      emitter.subscribe('foo', (action) => action, true);
      return emitter.emit('foo', 'bar')
      .then((values) => {
        assert(values.length === 1);
        assert(values[0] === 'bar');

        return emitter.emit('foo', 'bar');
      })
      .then((values) => {
        assert(values.length === 0);
        assert(values[0] === undefined);
      });
    });
  });

  describe('issues', () => {
    describe('.once', () => {
      it('#3: always the listener should be stopped at the removeListener', () => {
        const listener = () => 1;
        const emitter = new AsyncEmitter;
        emitter.once('foo', listener);
        emitter.removeListener('foo', listener);

        return emitter.emit('foo').then((values) => {
          assert(values.length === 0);
          assert(values[0] === undefined);
        });
      });
    });
  });
});
