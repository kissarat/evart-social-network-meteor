import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import {Subscriber, ScrollArea, Search, Busy} from './common/widget'
import {Avatar} from './common/widget'
import {idToTimeString} from './common/helpers'
import {Editor} from './blog/editor'

export class LastMessage extends Component {
  onClick = (e) => {
    this.props.open(this.props)
  }

  render() {
    const avatar = <Avatar {...this.props} className="img-responsive img-circle"/>
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
    const me = Meteor.userId()
    const className = (me == this.props.from ? 'right' : 'left') + ' message-container'
    return <li>
      <div className={className}>
        <div className="message">
          <div className="avatar">
            <Avatar {...this.props} className="img-responsive img-circle"/>
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

  add = () => {
    if ('chat' === this.props.type) {
      browserHistory.push(`/chat/${this.props.id}/edit`)
    }
    else {
      Meteor.call('chat.create', {manager: Meteor.userId(), follower: +this.props.id}, (err, chat) => {
        if (!err) {
          browserHistory.push(`/chat/${chat.id}/edit`)
        }
      })
    }
  }

  render() {
    const addMembers = 'dialog' === this.props.type || ('chat' === this.props.type && 'manage' === this.props.relation)
      ? this.add : null
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
      <Editor add={addMembers} {...this.props}/>
    </div>
  }
}

export class DialogList extends Subscriber {
  componentWillMount() {
    this.state = {busy: true}
    this.subscribe('messenger', {})
  }

  search = (string) => {
    this.subscribe('messenger', {search: string})
  }

  render() {
    const peerListView = this.state.busy
      ? <Busy/>
      : this.getSubscription('messenger')
      .map(peer => <LastMessage key={peer.id} {...peer} open={this.props.open}/>)
    return <div className="dialogs">
      <ScrollArea>{peerListView}</ScrollArea>
      <Search search={this.search} label="Search dialogs..."/>
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
              type: 'chat' === res.type ? 'chat' : 'dialog',
              relation: res.relation
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
