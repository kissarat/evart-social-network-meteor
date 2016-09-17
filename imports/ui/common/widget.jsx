import React, {Component} from 'react'
import _ from 'underscore'

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
    subscription.addEventListener('updated', () => this.setState({
      [name]: state,
      busy: false
    }))
    return subscription
  }

  unsubscribe(name) {
    const old = this.getSubscription(name, false)
    if (old) {
      old.stop()
    }
    delete this.subscription[name]
  }

  getSubscription(name, defaultValue = []) {
    if (!this.subscription) {
      this.subscription = {}
    }
    return this.subscription[name] || defaultValue
  }

  componentWillUnmount() {
    if (this.subscription) {
      for (const name in this.subscription) {
        this.unsubscribe(name)
      }
    }
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
    if (element) {
      element.classList.add('scroll')
    }
  }

  render() {
    return <ul ref={this.scroll}>{this.props.children}</ul>
  }
}

export class InputGroup extends Component {
  render() {
    const message = this.props.message ? <span className="help-block">{this.props.message}</span> : ''
    return <div className={'form-group' + (message ? ' has-error' : '')}>
      <label>{this.props.label}</label>
      <div className="control-container">
        {this.props.children}
        {message}
      </div>
    </div>
  }
}

export const Busy = () => <div className="busy-animation"></div>
