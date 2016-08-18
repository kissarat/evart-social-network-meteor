import React, {Component} from 'react'

export class Subscriber extends Component {
  subscibe(name, state = {}) {
    this.unsubscibe(name)
    this.subscription[name] = new PgSubscription(name, state)
    this.subscription[name].addEventListener('updated', () => this.setState({
      [name]: state
    }))
  }

  unsubscibe(name) {
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
