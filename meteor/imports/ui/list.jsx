import React, {Component} from 'react'
import {Subscriber, ScrollArea, Avatar, Search} from './common/widget'
import {Communicate} from './blog/layout'
import {Link} from 'react-router'

class ListHeader extends Component {
  render() {
    const first = location.pathname.split('/')[1]
    return <div className="container">
      <div className="row wrap">
        <div id="news">
          <div className="notification text-center">
            <div className="notification-tabs center-block">
              <Link to={'/invites'}
                    className={'notify ' + ('invites' == first ? 'active' : '')}
                    data-id="tab_invite">Invites</Link>
              <Link to={'/important'}
                    className={'response ' + ('important' == first ? 'active' : '')}
                    data-id="tab_important">Important</Link>
              <Link to={'/users'}
                    className={'stats ' + ('users' == first ? 'active' : '')}
                    data-id="tab_all">All</Link>
            </div>
            <Search search={this.props.search}/>
          </div>
          <div className="tabs">
            {this.props.children}
          </div>
        </div>
      </div>
    </div>
  }
}

class Contact extends Component {
  render() {
    console.log(this.props)
    const id = this.props.from || this.props.id
    const url = '/blog/' + id
    const online = <i className="online"/>
    const more = 'user' === this.props.type ?
      <div>
        <Communicate id={id}/>
        <p className="center-block">{this.props.birthday}</p>
      </div> : ''
    return <div className={'contact ' + this.props.type}>
      <div>
        <Link to={url} className="avatar">
          <Avatar {...this.props} className="circle"/>
        </Link>
        <div className="info">
          <div>
            <Link to={url} className="name">{this.props.name}</Link>
            <div className="location">{this.props.location}</div>
            <div className="more">{more}</div>
          </div>
        </div>
      </div>
    </div>
  }
}

export class Member extends Component {
  render() {
    return <div className="member">
      <div>
        <Avatar {...this.props} className="avatar back circle small"/>
      </div>
      <div className="info">
        <h4>{this.props.name}</h4>
        <div className="location">{this.props.location}</div>
      </div>
      <div className="actions">{this.props.children}</div>
    </div>
  }
}

class Establish extends Component {
  onChange = (e) => {
    let relation
    if (e.target.value) {
      relation = e.target.value
    }
    else if ('+' === e.target.innerHTML) {
      relation = 'follow'
    }
    else if ('-' === e.target.innerHTML) {
      relation = 'reject'
    }
    Meteor.call('establish', {id: +this.props.from, relation: relation})
  }

  render() {
    return <div className="switch-friends">
      <input type="radio" value="reject" className="disliked"
             checked={'reject' === this.props.relation} onChange={this.onChange}/>
      <input type="radio" className="none"
             checked={!this.props.relation} onChange={this.onChange}/>
      <input type="radio" value="follow" className="liked"
             checked={'follow' === this.props.relation} onChange={this.onChange}/>
      <div className="slider-dislike"></div>
      <button type="button" className="btn minus" onClick={this.onChange}>-</button>
      <button type="button" className="btn plus" onClick={this.onChange}>+</button>
    </div>
  }
}

class Invite extends Component {
  render() {
    return <div className="notification-item">
      <div className="user-info">
        <Avatar {...this.props} className="img-circle img-responsive"/>
        <div className="name">{this.props.name}</div>
        <span className="description">{this.props.location}</span>
      </div>
      <div className="user-content">
      </div>
      <div className="user-action">
        <Establish {...this.props}/>
      </div>
    </div>
  }
}

export class InviteList extends Subscriber {
  componentWillMount() {
    this.subscribe('invite', {type: 'user'})
  }

  search = (string) => {
    this.subscribe('invite', {type: 'user', search: string})
  }

  render() {
    const invites = this.getSubscription('invite').map(invite => <Invite key={invite.id} {...invite}/>)
    return <ListHeader search={this.search}>
      <div className="tab_invite">{invites}</div>
    </ListHeader>
  }
}

export class List extends Subscriber {
  componentWillMount() {
    this.state = {}
    this.componentWillReceiveProps(this.props)
  }

  renderList(list) {
    list = list.map(contact => <Contact key={contact.id} {...contact}/>)
    return <ScrollArea>{list}</ScrollArea>
  }
}

export class FriendList extends List {
  componentWillReceiveProps(props) {
    const params = {
      type: 'user',
      relation: 'follow'
    }
    if (props.params && props.params.id) {
      params.recipient = +props.params.id
    }
    this.subscribe('invite', params)
  }

  search = (string) => {
    const params = this.state.invite
    params.search = string
    this.subscribe('invite', params)
  }

  render() {
    const list = this.renderList(this.getSubscription('invite'))
    const searchBar = this.props.tiny ? <Search search={this.search}/> : ''
    const content =
      <div className="contact-list list">
        {searchBar}
        {list}
      </div>
    return this.props.tiny ? content : <ListHeader search={this.search}>{content}</ListHeader>
  }
}

export class UserList extends List {
  componentWillReceiveProps(props) {
    this.subscribe('blog', {type: 'user', order: {id: -1}})
  }

  search = (string) => {
    const params = this.state.blog
    params.search = string
    this.subscribe('blog', params)
  }

  render() {
    const list = this.renderList(this.getSubscription('blog'))
    if (this.props.tiny) {
      return <div className="contact-list list">
        <Search search={this.search}/>
        {list}
      </div>
    }
    else {
      return <ListHeader search={this.search}>
        <div className="contact-list list">
          {list}
        </div>
      </ListHeader>
    }
  }
}

export class SubscriberList extends List {
  componentWillReceiveProps(props) {
    const params = {}
    if (props.params && props.params.id) {
      params.recipient = +props.params.id
    }
    this.subscribe('subscription', params)
  }

  search = (string) => {
    const params = this.state.subscription
    params.search = string
    this.subscribe('subscription', params)
  }

  render() {
    const list = this.renderList(this.getSubscription('subscription'))
    return <div className="contact-list list subscriptions user">
      <Search search={this.search}/>
      {list}
    </div>
  }
}

export class Followers extends List {

}

export class GroupsList extends List {
  componentWillReceiveProps(props) {
    const params = {type: 'group'}
    if (props.params && props.params.id) {
      params.from = +props.params.id
      params.relation = 'follow'
    }
    this.subscribe(params.from ? 'from_list' : 'blog', params)
  }

  search = (string) => {
    const name = this.state.blog ? 'blog' : 'from_list'
    const params = this.state[name]
    params.search = string
    this.subscribe(name, params)
  }

  render() {
    const list = this.renderList(this.getSubscription(this.state.blog ? 'blog' : 'from_list'))
    return <div className="contact-list list group">
      <Search search={this.search}/>
      {list}
    </div>
  }
}
