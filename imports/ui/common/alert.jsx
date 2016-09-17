import React, {Component} from 'react'

export class Alert extends Component {
  componentWillReceiveProps(props) {
    if (props.timeout) {
      setTimeout(this.close, props.timeout)
    }
    if (props.callback instanceof Function) {
      props.callback(this)
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  close = () => {
    this.props.close(this.props.id)
  }

  render() {
    return <div className={'alert alert-dismissible fade in alert-' + this.props.type} role="alert">
      <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={this.close}>
        <span aria-hidden="true">&times;</span>
      </button>
      {this.props.message}
    </div>
  }
}

export class AlertQueue extends Component {
  static seq = 0

  static createId() {
    return 'alert_' + (++AlertQueue.seq).toString(36)
  }

  close = (id) => {
    this.setState({[id]: false})
  }

  handle = (payload) => {
    const id = AlertQueue.createId()
    const alert = <Alert key={id} id={id} close={this.close} {...payload}/>
    this.setState({[id]: alert})
    return true
  }

  componentWillMount() {
    this.handlerId = Meteor.dispatcher.register(this.handle)
  }

  componentWillUnmount() {
    Meteor.dispatcher.unregister(this.handlerId)
  }

  render() {
    return <div id="alert-queue">{_.toArray(this.state)}</div>
  }
}
