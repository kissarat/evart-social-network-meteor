import React, {Component} from 'react'
import {Subscriber} from './widget'

class Message extends Component {
  render() {
    return (
      <div key={this.props.id} className="message">
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
    this.subscribe('message', {
      recipient: +Meteor.user().id,
      peer: +this.props.id
    })
  }

  send = (e) => {
    if ('Enter' === e.key) {
      const data = {
        from: +Meteor.user().id,
        to: +this.props.id,
        text: this.draft()
      }
      Meteor.call('message.create', data,
        (err, res) => {
          if (err) {
            console.error(err)
          }
          else {
            localStorage.removeItem(`dialog_${this.props.id}_draft`)
          }
        })
    }
    else {
      this.draft(e.target.value)
    }
  }

  draft(value) {
    const key = `dialog_${this.props.id}_draft`
    if (value) {
      localStorage[key] = value
    }
    else {
      return localStorage[key] || ''
    }
  }

  render() {
    const messages = this.getSubscrition('message').map(m =>
      <Message key={m.id}
               className="message"
               id={m.id}
               name={m.name}
               text={m.text}
      />
    )
    return (
      <div className="dialog">
        <div>
          <div>{this.props.name}</div>
        </div>
        <div>{messages}</div>
        <form>
          <textarea onKeyDown={this.send}/>
        </form>
      </div>
    )
  }
}

export class Messenger extends Subscriber {
  componentWillMount() {
    this.subscribe('messenger', {
      recipient: +Meteor.user().id
    })
  }

  open = (e) => {
    this.subscribe('blog', {
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
      <div className="messenger">
        <div>{peers}</div>
        <div>{dialogs}</div>
      </div>
    )
  }
}
