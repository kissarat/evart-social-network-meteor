import _ from 'underscore'

export class Emitter {
  constructor() {
    Emitter.mix(this)
  }

  static mix(object) {
    object._events = {}
  }

  on(eventName, listener) {
    let listeners = this._events[eventName]
    if (!listeners) {
      listeners = this._events[eventName] = []
    }
    listeners.push(listener)
    return this
  }

  emit(eventName) {
    const listeners = this._events[eventName]
    if (listeners) {
      const args = [].slice.call(arguments, 1)
      listeners.forEach(listener => listener.apply(this, args))
      return true
    }
    return false
  }
}

export class Channel extends Emitter {
  constructor(name, params) {
    super()
    this.subscription = new PgSubscription(name, params)
    this.subscription.addEventListener('updated', (changes) => {
      _.each(changes.added, function (message) {
        Emitter.prototype.emit.call(this, message.type, message)
      }, this)
    })
  }

  dispatch(message) {
    return new Promise(function (resolve, reject) {
      Meteor.call('channel.push', message, function (err) {
        if (err) {
          reject(err)
        }
        else {
          resolve()
        }
      })
    })
  }
}

export const channel = new Channel('channel')

export function register(target, events) {
  _.each(events, function (listener, name) {
    target.addEventListener(name, listener)
  })
}

export function listenOnce(target, name, listener) {
  target.addEventListener(name, function once(e) {
    target.removeEventListener(name, once)
    listener(e)
  })
}

export function listenOncePromise(target, name) {
  return new Promise(function (resolve, reject) {
    listenOnce(target, name, resolve)
  })
}
