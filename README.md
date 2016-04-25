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

class `AsyncEmitter`
---

return a class that inherits the [EventEmitter](https://nodejs.org/api/events.html)

`.emit(event[, arg1, arg2...])` / `.emitParallel`
---

`.emit` is receive the return value of listeners asynchronously using [Promise.all](http://bluebirdjs.com/docs/api/promise.all.html).

```js
import AsyncEmitter from 'carrack';

const emitter = new AsyncEmitter;
emitter.on('foo', (action) => action);
emitter.on('foo', (action) => new Promise((resolve) => {
  setTimeout(() => resolve(action));
}));

return emitter.emit('foo', 'bar').then((values) => {
  assert(values[0] === 'bar');
  assert(values[1] === 'bar');
});
```

in addition, exceptions and rejects, the first one is thrown.

```js
import AsyncEmitter from 'carrack';

const emitter = new AsyncEmitter;
emitter.on('foo', (action) => action);
emitter.on('foo', () => Promise.reject(new Error('beep')));
emitter.on('foo', () => new Promise(() => {
  throw new Error('boop');
}));

emitter.emit('foo').catch((reason) => {
  console.log(reason.message); // beep
});
```

`.emitSerial(event[, arg1, arg2...])`
---

run the listener in serial.
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
.emitSerial('delay').then((values) => {
  console.log(values);
  // [
  // 1460566000000
  // 1460566000100
  // 1460566000200
  // ]
});

new AsyncEmitter()
.on('foo', () => console.log('bar'))
.on('foo', () => Promise.reject('abort'))
.on('foo', () => console.log('baz'))
.emitSerial('foo');
// bar
// Unhandled rejection abort
```

`.emitReduce(event[, arg1, arg2...])` / `.emitReduceRight`
---

run the listener in serial using return value of the previous listener.
the last return value is always an array.

```js
const emitter = new AsyncEmitter()
.on('square', (keys, value) => Promise.resolve([keys.concat(1), value * value]))
.on('square', (keys, value) => Promise.resolve([keys.concat(2), value * value]))
.on('square', (keys, value) => Promise.resolve([keys.concat(3), value * value]))
;

emitter.emitReduce('square', [], 2)
.then((args) => {
  console.log(args[0], args[1]);
  // [ 1, 2, 3 ] 256
});

emitter.emitReduceRight('square', [], 2)
.then((args) => {
  console.log(args[0], args[1]);
  // [ 3, 2, 1 ] 256
});
```

`.subscribe(event, listener, once = false)` => `unsubscribe()`
---
alias for `emitter.on` and `emitter.removeListener`.
makes it easy to remove the listener when needed.

```js
import AsyncEmitter from './src';

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
