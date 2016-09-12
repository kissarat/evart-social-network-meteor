import React, {Component} from 'react'

export class Subscriber extends Component {
  subscribe(name, state = {}) {
    if (!this.subscription) {
      this.subscription = {}
    }
    let subscription = this.subscription[name]
    if (subscription instanceof PgSubscription) {
      subscription.change(state)
    }
    else {
      subscription = new PgSubscription(name, state)
      this.subscription[name] = subscription
    }
    subscription.addEventListener('updated', () => this.setState({[name]: state}))
  }

  unsubscribe(name) {
    const old = this.getSubscription(name, false)
    if (old) {
      old.stop()
    }
  }

  isSubscriptionReady(name) {
    const subscription = this.getSubscription(name, false)
    return subscription && subscription.ready()
  }

  getSubscription(name, defaultValue = []) {
    if (!this.subscription) {
      this.subscription = {}
    }
    return this.subscription[name] || defaultValue
  }

  componentWillUnmount() {
    _.each(this.subscription, (subscription, name) => subscription.stop())
  }
}

export class ScrollArea extends Component {
  scroll(element) {
    // $(element).mCustomScrollbar({
    //   theme: 'minimal-dark',
    //   axis: 'y',
    //   scrollInertia: 400,
    //   autoDraggerLength: false,
    //   mouseWheel: {
    //     scrollAmount: 200
    //   }
    // })
    element.classList.add('scroll')
  }

  render() {
    return <ul ref={this.scroll}>{this.props.children}</ul>
  }
}
