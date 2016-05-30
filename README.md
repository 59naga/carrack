Carrack
---

<p align="right">
  <a href="https://npmjs.org/package/carrack">
    <img src="https://img.shields.io/npm/v/carrack.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/59naga/carrack">
    <img src="http://img.shields.io/travis/59naga/carrack.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/carrack/coverage">
    <img src="https://img.shields.io/codeclimate/github/59naga/carrack.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/carrack">
    <img src="https://img.shields.io/codeclimate/coverage/github/59naga/carrack.svg?style=flat-square">
  </a>
  <a href="https://gemnasium.com/59naga/carrack">
    <img src="https://img.shields.io/gemnasium/59naga/carrack.svg?style=flat-square">
  </a>
</p>

<p align="center">
  <a href="https://saucelabs.com/u/59798">
    <img src="http://soysauce.berabou.me/u/59798/carrack.svg">
  </a>
</p>

Installation
---
```bash
$ npm install carrack --save
```

API
---

class `AsyncEmitter` extends [EventEmitter](https://nodejs.org/api/events.html)
---

`.emitParallel(event[, arg1, arg2...])` -> `Promise<values>`
---

run the listeners in parallel using [Promise.all](http://bluebirdjs.com/docs/api/promise.all.html).

```js
import AsyncEmitter from 'carrack';

new AsyncEmitter()
  .on('foo', (action) => action)
  .on('foo', (action) => new Promise((resolve) => {
    setTimeout(() => resolve(action));
  }))
  .emitParallel('foo', 'bar')
  .then(console.log.bind(console)); // ['bar', 'bar']
```

in addition, exceptions and rejects, the first one is thrown.

```js
new AsyncEmitter()
  .on('foo', (action) => action)
  .on('foo', () => Promise.reject(new Error('beep')))
  .on('foo', () => new Promise(() => {
    throw new Error('boop');
  }))
  .emitParallel('foo')
  .catch(console.log.bind(console)); // [Error: beep]
```

`.emitSerial(event[, arg1, arg2...])` -> `Promise<values>`
---

run the listeners in serial.
if listener returned the exception, will not be executed later listener.

```js
new AsyncEmitter()
  .on('delay', () => new Promise(resolve => {
    setTimeout(() => resolve(Date.now()), 100);
  }))
  .on('delay', () => new Promise(resolve => {
    setTimeout(() => resolve(Date.now()), 100);
  }))
  .on('delay', () => new Promise(resolve => {
    setTimeout(() => resolve(Date.now()), 100);
  }))
  .emitSerial('delay')
  .then(console.log.bind(console));
  // [
  //   1460566000100,
  //   1460566000200,
  //   1460566000300
  // ]

new AsyncEmitter()
  .on('foo', () => console.log('bar'))
  .on('foo', () => Promise.reject('abort'))
  .on('foo', () => console.log('baz'))
  .emitSerial('foo');
// bar
// Unhandled rejection abort
```

`.emitReduce(event[, arg1, arg2...])` / `.emitReduceRight` -> `Promise<value>`
---

run the listener in serial using return value of the previous listener.
the last return value is always an array.

```js
const emitter = new AsyncEmitter()
  .on('square', (keys, value) => Promise.resolve([keys.concat(1), value * value]))
  .on('square', (keys, value) => Promise.resolve([keys.concat(2), value * value]))
  .on('square', (keys, value) => Promise.resolve([keys.concat(3), value * value]))
;

emitter
  .emitReduce('square', [], 2)
  .spread((keys, value) => {
    console.log(keys, value);
    // [ 1, 2, 3 ] 256
  });

emitter
  .emitReduceRight('square', [], 2)
  .spread((keys, value) => {
    console.log(keys, value);
    // [ 3, 2, 1 ] 256
  });
```

`.setConcurrency(max)`
---
to limit the maximum number of concurrent execution of the listener of this instance.
this limit applies to the above-mentioned ".emit*" method (doesn't apply to `.emit`).

```js
(async () => {
  const delayListener = () => new Promise(resolve => {
    setTimeout(() => resolve(Date.now()), 100);
  });
  const emitter = new AsyncEmitter(1) // first argument `.setConcurrency` alias
  .on('foo', delayListener)
  .on('foo', delayListener)
  .on('foo', delayListener)
  .on('foo', delayListener)
  .on('foo', delayListener);

  console.log(await emitter.emitParallel('foo'));
  // [ 1464602000100,
  //   1464602000200,
  //   1464602000300,
  //   1464602000400,
  //   1464602000500 ]

  console.log(await emitter.setConcurrency(2).emitParallel('foo'));
  // [ 1464602000600,
  //   1464602000600,
  //   1464602000700,
  //   1464602000700,
  //   1464602000800 ]

  console.log(await emitter.setConcurrency(null).emitParallel('foo'));
  // [ 1464602000800,
  //   1464602000800,
  //   1464602000800,
  //   1464602000800,
  //   1464602000800 ]
})();
```

`.subscribe(event, listener, once = false)` => `unsubscribe()`
---
alias for `emitter.on` and `emitter.removeListener`.
makes it easy to remove the listener when needed.

```js
// ...
const emitter = new AsyncEmitter;

class Component extends React.Component {
  componentDidMount() {
    this.unsubscribes = [];
    this.unsubscribes.push(emitter.subscribe('foo', ::this.handleFoo));
    this.unsubscribes.push(emitter.subscribe('bar', ::this.handleBar));
    this.unsubscribes.push(emitter.subscribe('baz', ::this.handleBaz));
  }
  componentWillUnmount() {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe());
  }
}
```

License
---
[MIT](http://59naga.mit-license.org/)
