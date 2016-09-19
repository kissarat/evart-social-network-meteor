import React, {Component} from 'react'
import {browserHistory} from 'react-router'
import {Subscriber, ScrollArea, Busy, InputGroup} from '/imports/ui/common/widget'
import {Member} from '/imports/ui/list'

export class ChatAddMember extends Subscriber {
  componentWillReceiveProps(props) {
    this.subscribe('candidate', {from: +props.id})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onClickAdd = (e) => {
    const id = +e.target.getAttribute('data-id')
    Meteor.call('member.add', {to: id, type: 'follow', from: +this.props.id})
  }

  render() {
    const members = this.getSubscription('candidate').map(member => <Member key={member.id} {...member}>
      <div className="glyphicon glyphicon-plus" data-id={member.id} onClick={this.onClickAdd}/>
    </Member>)
    return <div className="list add-member-list">
      <ScrollArea>{members}</ScrollArea>
      <div className="search"></div>
    </div>
  }
}

export class MemberList extends Subscriber {
  componentWillReceiveProps(props) {
    this.subscribe('member', {
      from: +props.id,
      type: 'user'
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onClickRemove = (e) => {
    Meteor.call('member.remove', {from: this.props.id, to: +e.target.getAttribute('data-id')})
  }

  onChangeType = (e) => {
    Meteor.call('member.update', {from: this.props.id, to: +e.target.getAttribute('data-id')}, {type: e.target.value})
  }

  render() {
    const members = this.getSubscription('member').map(member => <Member key={member.id} {...member}>
      <select name="type" value={member.relation} data-id={member.id} onChange={this.onChangeType}>
        <option value="follow">Subscriber</option>
        <option value="manage">Manager</option>
      </select>
      <div className="glyphicon glyphicon-remove" data-id={member.id} onClick={this.onClickRemove}></div>
    </Member>)
    return <div className="list edit-member-list">
      <ScrollArea>{members}</ScrollArea>
      <div className="search"></div>
    </div>
  }
}

export class Chat extends Component {
  componentWillReceiveProps(props) {
    Meteor.call('blog.get', {id: props.params.id}, (err, state) => {
      if (!err) {
        this.setState(state)
      }
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  onClickEditList = () => {
    this.setState({add: false})
  }

  onClickAddList = () => {
    this.setState({add: true})
  }

  onSubmit = (e) => {
    e.preventDefault()
    const id = +this.props.params.id
    Meteor.call('blog.update', {id}, _.pick(this.state, 'name'), err => {
      if (!err) {
        browserHistory.push('/dialog/' + id)
      }
    })
  }

  render() {
    if (this.state) {
      const button = this.state.add
        ? <button className="btn btn-primary" onClick={this.onClickEditList} type="button">Edit Members</button>
        : <button className="btn btn-primary" onClick={this.onClickAddList} type="button">Add Members</button>
      const list = this.state.add ? <ChatAddMember id={this.state.id}/> : <MemberList id={this.state.id}/>
      return <div className="chat edit-chat settings">
        <form method="post" onSubmit={this.onSubmit}>
          <h1>Chat Settings</h1>
          <InputGroup label="Name">
            <input name="name" className="form-control" value={this.state.name || ''} onChange={this.onChange}/>
          </InputGroup>
          <div className="buttons">
            {button}
            <button className="btn btn-success" type="submit">Save</button>
          </div>
        </form>
        {list}
      </div>
    }
    else {
      return <Busy/>
    }
  }
}

export class Editor extends Component {
  componentWillMount() {
    this.state = {}
  }

  onSubmit = (e) => {
    e.nativeEvent.preventDefault()
    this.send()
  }

  send = () => {
    const text = this.state.text.trim()
    if (text) {
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

  onKeyPress = (e) => {
    if ('Enter' === e.nativeEvent.key) {
      this.setState({text: e.target.value})
      this.send()
    }
  }

  render() {
    const chatAdd = this.props.add ?
      <div className="chat-add" onClick={this.props.add}>
        <div className="icon icon-add"></div>
      </div> : ''
    return <form className="editor">
      <label htmlFor="file">
        <div className="icon icon-attach"/>
        <input type="file" name="file" id="file" className="hidden"/>
      </label>
      <textarea
        name="message"
        placeholder="Type your message..."
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        value={this.state.text}/>
      {chatAdd}
      <div className="emoji">
        <span className="icon icon-smile"/>
      </div>
      <button className="send" type="submit" onClick={this.onSubmit}>
        <div className="icon icon-send"/>
      </button>
    </form>
  }
}
