import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import {Subscriber, ScrollArea, Busy} from './common/widget'
import {idToTimeString} from './common/helpers'
import {Editor} from './blog/editor'

export class LastMessage extends Component {
  onClick = (e) => {
    this.props.open(this.props)
  }

  render() {
    const avatar = <img src="/images/profile-image.jpg" alt="" className="img-responsive img-circle"/>
    const count = this.props.count > 0 ? <div className="count">{this.props.count}</div> : ''
    const info = 'chat' === this.props.type
      ? <div className="photo">{avatar}{count}</div>
      : <Link to={'/dialog/' + this.props.id} className="photo">{avatar}{count}</Link>
    return <li>
      {info}
      <div className="content" id={this.props.id} onClick={this.onClick}>
        <span className="icon icon-close-gray"/>
        <span className="date">{idToTimeString(this.props.message)}</span>
        <div className="name">{this.props.name || 'Untitled'}</div>
        <div className="last">{this.props.text}</div>
      </div>
    </li>
  }
}

export class Message extends Component {
  render() {
    const me = parseInt(Meteor.userId(), 36)
    const className = (me == this.props.from ? 'right' : 'left') + ' message-container'
    return <li>
      <div className={className}>
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
      </div>
    </li>
  }
}

export class Dialog extends Subscriber {
  componentWillReceiveProps(props) {
    this.setState({busy: true})
    this.subscribe('message', {
      type: props.type,
      peer: +props.id
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onRenderMessageElement(array, i, element, message) {
    if (0 === i && element) {
      element.scrollIntoView(false)
    }
  }

  render() {
    const messages = this.state.busy
      ? <Busy/>
      : this.getSubscription('message').map((message, i, array) =>
      <Message
        key={message.id}
        {...message}
        onRenderElement={this.onRenderMessageElement.bind(this, array, i)}/>
    )
    return <div className="messages">
      <ScrollArea>{messages}</ScrollArea>
      <Editor {...this.props}/>
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

export class DialogList extends Subscriber {
  componentWillMount() {
    this.state = {busy: true}
    this.subscribe('messenger', {})
  }

  render() {
    const peerListView = this.state.busy
      ? <Busy/>
      : this.getSubscription('messenger')
      .map(peer => <LastMessage key={peer.id} {...peer} open={this.props.open}/>)
    return <div className="dialogs">
      <ScrollArea>{peerListView}</ScrollArea>
      <div className="search">
        <input type="search" placeholder="Search dialog"/>
        <button type="button">
          <span className="icon icon-search"/>
        </button>
      </div>
    </div>
  }
}

export class Messenger extends Subscriber {
  componentWillReceiveProps(props) {
    if (props.params.peer) {
      Meteor.call('blog.get', {id: props.params.peer}, (err, res) => {
        if (err) {
          console.error(err)
        }
        else {
          this.setState({
            peer: {
              id: +res.id,
              type: 'chat' === res.type ? 'chat' : 'dialog'
            }
          })
        }
      })
    }
  }

  componentWillMount() {
    this.state = {}
    this.componentWillReceiveProps(this.props)
  }

  open = (lastMessage) => {
    browserHistory.push('/dialog/' + lastMessage.id)
  }

  render() {
    const dialog = this.state.peer ? <Dialog {...this.state.peer}/> : ''
    return <div className="messenger-container dock-shrink">
      <DialogList open={this.open}/>
      {dialog}
    </div>
  }
}
