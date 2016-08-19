import React, {Component} from 'react'

export class Subscriber extends Component {
  subscribe(name, state = {}) {
    this.unsubscribe(name)
    const subscription = new PgSubscription(name, state)
    this.subscription[name] = subscription
    subscription.addEventListener('updated', () => this.set(name, state))
  }

  unsubscribe(name) {
    const old = this.getSubscrition(name, false)
    if (old) {
      old.stop()
    }
  }

  get(name, defaultValue = {}) {
    if (!this.state) {
      this.state = {}
    }
    return this.state[name] || defaultValue
  }

  set(name, value = {}) {
    const state = this.get(name)
    state[name] = value
    this.setState(state)
  }

  change(name, changes) {
    const state = this.get(name)
    for (let key in changes) {
      const value = changes[key]
      if (undefined === value) {
        delete state[name]
      }
      else {
        state[key] = state
      }
    }
    this.set(name, state)
  }

  getSubscrition(name, defaultValue = []) {
    if (!this.subscription) {
      this.subscription = {}
    }
    return this.subscription[name] || defaultValue
  }

  componentWillUnmount() {
    _.each(this.subscription, (subscription, name) => subscription.stop())
  }
}
