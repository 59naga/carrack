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

`AsyncEmitter.emit(event[, arg1, arg2...])`
---

`AsyncEmitter.emit` is receive the return value of listeners asynchronously using [Promise.all](http://bluebirdjs.com/docs/api/promise.all.html).

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
emitter.on('foo', () => Promise.reject(new Error('kabo?')));
emitter.on('foo', () => new Promise(() => {
  throw new Error('kaboom');
}));

emitter.emit('foo').catch((reason) => {
  console.log(reason.message); // kabo?
});
```

`AsyncEmitter.subscribe(event, listener, once = false)` => `unsubscribe()`
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
