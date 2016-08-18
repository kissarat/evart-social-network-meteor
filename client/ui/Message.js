import React, {Component} from 'react'
import {Subscriber} from './widget'

class Message extends Component {
  render() {
    return (
      <div key={this.props.id}>
        <div>
          <img src={this.props.avatar}/>
          <div className="name">{this.props.name}</div>
        </div>
        <div className="text">{this.props.text}</div>
      </div>
    )
  }
}

export class Dialog extends Subscriber {
  componentWillMount() {
    this.subscibe('message', {
      recipient: +localStorage.recipient,
      peer: +this.props.id
    })
  }

  render() {
    const messages = this.getSubscrition('message').map(m =>
      <Message key={m.id}
               id={m.id}
               name={m.name}
               text={m.text}
      />
    )
    return (
      <div>
        <div>
          <div>{this.props.name}</div>
        </div>
        <div>{messages}</div>
        <div>
        </div>
      </div>
    )
  }
}

export class Messenger extends Subscriber {
  componentWillMount() {
    this.subscibe('messenger', {
      recipient: +localStorage.recipient
    })
  }

  open = (e) => {
    this.subscibe('blog', {
      id: e.target.id
    })
  }

  render() {
    const peers = this.getSubscrition('messenger').map(p =>
      <div key={p.id} onClick={this.open}>
        <div id={p.id}>{p.name}</div>
      </div>
    )
    const dialogs = this.getSubscrition('blog').map(p =>
      <Dialog key={p.id}
              id={p.id}
              name={p.name}
      />
    )
    return (
      <div>
        <div>{peers}</div>
        <div>{dialogs}</div>
      </div>
    )
  }
}
