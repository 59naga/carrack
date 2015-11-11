# Carrack

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
</p>

<p align="center">
  <a href="https://saucelabs.com/u/59798">
    <img src="http://soysauce.berabou.me/u/59798/carrack.svg">
  </a>
</p>

## Installation

```bash
$ npm install carrack --save
```

# API

## class `AsyncEmitter`

return a class that inherits the [EventEmitter](https://nodejs.org/api/events.html)

## `AsyncEmitter.emit(event[,arg1,arg2...])`

[Calls each of the listeners in order with the supplied arguments][1].
Receives the Promise of the listeners, and then run the [Promise.all][2].

[1]: https://nodejs.org/api/events.html#events_emitter_emit_event_arg1_arg2
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

```js
import AsyncEmitter from 'carrack'

let emitter= new AsyncEmitter

// Add event listeners
emitter.on('foo',(arg1)=>{
  return new Promise((resolve,reject)=>{
    if(arg1==null){
      resolve('bar')
    }
    else{
      reject(new Error('beep'))
    }
  })
})
emitter.once('foo',(arg1)=>{
  return 'baz'// only once
})

// Dispatch the `foo` event
emitter.emit('foo')
.then(values=>{
  console.log(values[0] === 'bar') // true
  console.log(values[1] === 'baz') // true

  return emitter.emit('foo')
})
.then(values=>{
  console.log(values[0] === 'bar') // true
  console.log(values[1] === undefined) // true
  
  // expect to be rejected
  return emitter.emit('foo','kaboom')
})
.catch(reason=>{
  console.error(reason.message === 'beep') // true
})
```

License
---
[MIT](http://59naga.mit-license.org/)
