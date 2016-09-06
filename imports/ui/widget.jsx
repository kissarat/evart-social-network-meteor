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
