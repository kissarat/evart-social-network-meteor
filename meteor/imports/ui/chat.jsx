import React, {Component} from 'react'
import {Subscriber, ScrollArea, Busy, InputGroup, Search, ImageDropzone, Avatar} from '/imports/ui/common/widget'
import {browserHistory} from 'react-router'
import {Member} from './list'
import {upload} from '/imports/ui/common/helpers'

export class ChatAddMember extends Subscriber {
  componentWillReceiveProps(props) {
    this.subscribe('candidate', {from: +props.id})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  search = (string) => {
    this.subscribe('candidate', {from: +this.props.id, search: string})
  }

  onClickAdd = (e) => {
    const id = +e.target.getAttribute('data-id')
    Meteor.call('member.add', {to: id, type: 'follow', from: +this.props.id})
  }

  render() {
    if (this.state) {
      const members = this.getSubscription('candidate').map(member => <Member key={member.id} {...member}>
        <div className="glyphicon glyphicon-plus" data-id={member.id} onClick={this.onClickAdd}/>
      </Member>)
      return <div className="list add-member-list">
        <Search search={this.search}/>
        <ScrollArea>{members}</ScrollArea>
      </div>
    }
    else {
      return <Busy/>
    }
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

  search = (string) => {
    this.subscribe('member', {from: +this.props.id, type: 'user', search: string})
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
      <Search search={this.search}/>
      <ScrollArea>{members}</ScrollArea>
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
    const id = this.props.params.id
    Meteor.call('blog.update', {id}, _.pick(this.state, 'name'), err => {
      if (!err) {
        browserHistory.push('/dialog/' + id)
      }
    })
  }

  onDrop = (files) => upload(files[0]).then(data => {
    return new Promise((resolve, reject) => {
      Meteor.call('blog.update', {id: +this.props.params.id}, {avatar: data.id}, (err, res) => {
        if (err) {
          reject(err)
        }
        else {
          this.setState({avatar: data.id})
          resolve(res)
        }
      })
    })
  })

  render() {
    if (this.state) {
      const button = this.state.add
        ? <button className="btn btn-primary" onClick={this.onClickEditList} type="button">Edit Members</button>
        : <button className="btn btn-primary" onClick={this.onClickAddList} type="button">Add Members</button>
      const list = this.state.add ? <ChatAddMember id={this.state.id}/> : <MemberList id={this.state.id}/>
      return <div className="chat edit-chat">
        <form className="settings" method="post" onSubmit={this.onSubmit}>
          <h1>Chat Settings</h1>
          <InputGroup label="Name">
            <input name="name" className="form-control" value={this.state.name || ''} onChange={this.onChange}/>
          </InputGroup>
          <InputGroup label="Avatar">
            <ImageDropzone
              {...this.state}
              imageId={this.state.avatar}
              imageProperty="avatar"
              onDrop={this.onDrop}
              relation="manage">
              <Avatar
                avatar={this.state.avatar}
                type={this.state.type}
                big={true}
                className="avatar middle"
              />
            </ImageDropzone>
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
