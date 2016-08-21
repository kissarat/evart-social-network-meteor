import React, {Component} from 'react'
import {Subscriber} from './widget'
import {Route} from 'react-router'

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
    const params = {
      type: this.props.type,
      ['dialog' === this.props.type ? 'peer' : 'parent']: +this.props.id
    }
    this.subscribe('message', params)
  }

  send = (e) => {
    if ('Enter' === e.key) {
      const data = {
        type: this.props.type,
        from: +Meteor.user().id,
        ['dialog' === this.props.type ? 'to' : 'parent']: +this.props.id,
        text: this.draft()
      }
      console.log(this.props)
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

export class Wall extends Subscriber {
  render() {
    return <Dialog id={+this.props.params.id} type='wall'/>
  }
}

export const MessageRoute =
  <Route>
    <Route path='messenger' component={Messenger}/>,
    <Route path='dialog/:peer' component={Messenger}/>,
    <Route path='blog/:id' component={Wall}/>
  </Route>
