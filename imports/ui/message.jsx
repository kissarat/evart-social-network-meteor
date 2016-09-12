import React, {Component} from 'react'
import {Link} from 'react-router'
import {Subscriber, ScrollArea} from './common/widget'
import {idToTimeString} from './common/helpers'

export class LastMessage extends Component {
  render() {
    const avatar = <img src="/images/profile-image.jpg" alt="" className="img-responsive img-circle"/>
    const count = this.props.count > 0 ? <div className="count">{this.props.count}</div> : ''
    return <li>
      <div className="photo">
        {avatar}
        {count}
      </div>
      <Link to={'/dialog/' + this.props.id} className="content">
        <span className="icon icon-close-gray"/>
        <span className="date">{idToTimeString(this.props.message)}</span>
        <div className="name">{this.props.name || 'Untitled'}</div>
        <div className="last">{this.props.text}</div>
      </Link>
    </li>
  }
}

export class Message extends Component {
  render() {
    return <li className='message-container'>
      <div className="message">
        <div className="avatar">
          <img src="/images/profile-image.jpg" alt="..." className="img-responsive img-circle"/>
        </div>
        <div className="text">{this.props.text}</div>
        <div className="time">{idToTimeString(this.props.id)}</div>
      </div>
      <div className="chbox">
        <input type="checkbox"/>
        <label/>
      </div>
      <div className="options">
        <span className="icon icon-dialog-repost-white"/>
        <span className="icon icon-dialog-trash-white"/>
        <div className="arrow-down"></div>
      </div>
    </li>
  }
}

export class Editor extends Component {
  draft(value) {
    const key = `dialog_${this.props.id}_draft`
    if (value) {
      localStorage[key] = value
    }
    else {
      return localStorage[key] || ''
    }
  }

  onSubmit = (e) => {
    if ('Enter' === e.key) {
      const data = {
        type: this.props.type,
        from: +Meteor.userId(),
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

  render() {
    return <form id="@@id" className="message-block">
      <label htmlFor="file">
        <span className="icon icon-attach"/>
        <input type="file" name="file" id="file" className="hidden"/>
      </label>
      <textarea name="messsage" placeholder="Type your message..."/>
      <div className="controls">
        <div className="add">
          <span className="icon icon-add"/>
        </div>
        <div className="emoji">
          <span className="icon icon-smile"/>
        </div>
        <button className="send" type="submit" onClick={this.onSubmit}>
          <span className="icon icon-send"/>
        </button>
      </div>
    </form>
  }
}

export class Dialog extends Subscriber {
  componentWillReceiveProps(props) {
    const params = {
      type: props.type,
      ['dialog' === props.type ? 'peer' : 'parent']: +props.id
    }
    this.subscribe('message', params)
  }

  render() {
    const messages = this.getSubscription('message')
      .map(message => <Message key={message.id} {...message} />)
    return <div className="messages">
      <ScrollArea>{messages}</ScrollArea>
      <Editor/>
      <div className="addblock hidden">
        <div className="head">
          <span>Public chat</span>
          <span className="icon icon-dialog-menu"/>
        </div>
        <div className="content">
        </div>
        <div className="footer find">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Search"/>
            <span className="input-group-addon">
              <i className="icon icon-dialog-search"/>
            </span>
          </div>
        </div>
      </div>
      <div className="addmenu hidden">
        <ul>
          <li><a href="#">Change chat name</a></li>
          <li><a href="#">Add chat icon</a></li>
          <li><a href="#">Show members</a></li>
          <li><a href="#">Leave conversation</a></li>
          <li><a href="#">Delete conversation</a></li>
        </ul>
      </div>
    </div>
  }
}

export class Messenger extends Subscriber {
  componentWillMount() {
    this.subscribe('messenger', {})
  }

  render() {
    const peers = this.getSubscription('messenger')
    const peerListView = this.getSubscription('messenger').map(peer => <LastMessage key={peer.id} {...peer}/>)
    const dialog = this.props.params.peer ? <Dialog {...peers.find(peer => peer.id === this.props.params.peer)}/> : ''
    return <div className="container">
      <div className="row wrap">
        <div id="messenger">
          <div className="messenger-container">
            <div className="dialogs">
              <ScrollArea>{peerListView}</ScrollArea>
              <div className="find">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Search dialog"/>
                  <span className="input-group-addon">
                    <i className="icon icon-search"/>
                  </span>
                </div>
              </div>
            </div>
            {dialog}
          </div>
        </div>
      </div>
    </div>
  }
}
