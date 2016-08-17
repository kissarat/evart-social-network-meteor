import React, {Component} from 'react'

export class ListView extends Component {
  componentWillMount() {
    this.subscibe()
  }

  subscibe(state = {}) {
    if (this.subscription) {
      this.subscription.stop()
    }
    this.subscription = new PgSubscription(this.subscriptionName, state)
    this.subscription.addEventListener('updated', () => this.setState(state))
  }

  componentWillUnmount() {
    this.subscription.stop()
  }
}
