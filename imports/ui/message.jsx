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
    const me = parseInt(Meteor.userId(), 36)
    const className = (me == this.props.from ? '' : 'left') + 'message-container'
    return <li className={className} ref={element => this.props.onRenderElement(element, this.props)}>
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
  componentWillMount() {
    this.state = {}
  }

  onSubmit = (e) => {
    e = e.nativeEvent
    e.preventDefault()
    const text = this.state.text.trim()
    if (text && (e instanceof MouseEvent || 'Enter' === e.key)) {
      const data = {
        type: this.props.type,
        ['dialog' === this.props.type ? 'to' : 'parent']: +this.props.id,
        text: text
      }
      Meteor.call('message.create', data,
        (err, res) => {
          if (err) {
            console.error(err)
          }
          else {
            this.setState({text: ''})
          }
        })
    }
  }

  onChange = (e) => {
    this.setState({text: e.target.value})
  }

  render() {
    return <form id="@@id" className="message-block">
      <label htmlFor="file">
        <span className="icon icon-attach"/>
        <input type="file" name="file" id="file" className="hidden"/>
      </label>
      <textarea name="messsage" placeholder="Type your message..." onChange={this.onChange}/>
      <div className="controls">
        <div className="add">
          <span className="icon icon-add"/>
        </div>
        <div className="emoji">
          <span className="icon icon-smile"/>
        </div>
        <button className="send" type="submit" onClick={this.onSubmit} value={this.state.text}>
          <span className="icon icon-send"/>
        </button>
      </div>
    </form>
  }
}

export class Dialog extends Subscriber {
  setupSubscription(props) {
    this.subscribe('message', {
      type: props.type,
      ['dialog' === props.type ? 'peer' : 'parent']: +props.id
    })
  }

  componentWillMount() {
    this.setupSubscription(this.props)
  }

  componentWillReceiveProps(props) {
    this.setupSubscription(props)
  }

  onRenderMessageElement(array, i, element, message) {
    if (0 === i && element) {
      element.scrollIntoView(false)
    }
  }

  render() {
    const messages = this.getSubscription('message').map((message, i, array) => <Message
      key={message.id}
      {...message}
      onRenderElement={this.onRenderMessageElement.bind(this, array, i)}/>)
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

export class Messenger extends Subscriber {
  setupTarget() {
    if (this.props.params.peer) {
      const peer = this.getSubscription('messenger').find(peer => peer.id === this.props.params.peer)
      if (peer) {
        this.setState({peer})
      }
      else {
        Meteor.call('blog.get', {id: this.props.params.peer}, (err, res) => {
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
  }

  componentWillMount() {
    this.state = {}
    this.subscribe('messenger', {})
    this.setupTarget()
  }

  componentWillReceiveProps() {
    this.setupTarget()
  }

  render() {
    const peerListView = this.getSubscription('messenger').map(peer => <LastMessage key={peer.id} {...peer}/>)
    const dialog = this.state.peer ? <Dialog {...this.state.peer}/> : ''
    return <div className="container">
      <div className="row wrap">
        <div id="messenger">
          <div className="messenger-container">
            <div className="dialogs">
              <ScrollArea>{peerListView}</ScrollArea>
              <div className="  find">
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
