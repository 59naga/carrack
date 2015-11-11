// Dependencies
import {EventEmitter} from 'events'
import Promise from 'bluebird'

// Public
class Carrack extends EventEmitter{
  once(event,listener){
    if(typeof listener!=='function'){
      throw new TypeError('listener must be a function')
    }

    let fired= false

    let onceListener= (...args)=>{
      this.removeListener(event,onceListener)

      if(fired===false){
        fired= true
        return listener(...args)
      }
    }
    this.on(event,onceListener)

    return this
  }
  emit(event,...args){
    let promises= []

    this.listeners(event).forEach(listener=>{
      promises.push(listener(...args))
    })

    return Promise.all(promises)
  }
}

export default Carrack
