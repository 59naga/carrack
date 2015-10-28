// Dependencies
import EventEmitter from '../src'

import Promise from 'bluebird'
import assert from 'power-assert'

// Specs
describe('carrack',function(){
  this.timeout(500)

  describe('.emit',()=>{
    it('values is passed as an array of values from all the listeners',()=>{
      let emitter
      emitter= new EventEmitter
      emitter.once('foo',(data)=>{
        return new Promise((resolve,reject)=>{
          resolve(data)
        })
      })

      let promise
      promise= emitter.emit('foo','bar')
      .then(values=>{
        assert(values[0] === 'bar')

        return emitter.emit('foo','bar')
      })
      .then(values=>{
        assert(values[0] === undefined)
      })

      return promise
    })

    it('discarding all the other promises whether or not they have resolved',()=>{
      let emitter
      emitter= new EventEmitter
      emitter.on('foo',(data)=>{
        return new Promise((resolve,reject)=>{
          resolve(data)
        })
      })
      emitter.on('foo',(data)=>{
        return new Promise((resolve,reject)=>{
          reject(new Error(data))
        })
      })

      let promise
      promise= emitter.emit('foo','bar').catch(reason=>{
        assert(reason instanceof Error)
        assert(reason.message === 'bar')
      })

      return promise
    })
  })
})
