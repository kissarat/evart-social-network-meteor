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
    this.subscription = PgSubscription(name, params)
    this.subscription.addEventListener('updated', function (changes) {
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
