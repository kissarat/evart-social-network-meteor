import React, {Component} from 'react'
import {Subscriber, ScrollArea, Avatar} from './common/widget'
import {Communicate} from './blog/layout'
import {Link} from 'react-router'

class ListHeader extends Component {
  render() {
    return <div className="container">
      <div className="row wrap">
        <div id="news">
          <div className="notification text-center">
            <div className="notification-tabs center-block">
              <span className="notify active" data-id="tab_invite">Invites</span>
              <span className="response" data-id="tab_important">Important</span>
              <span className="stats" data-id="tab_all">All</span>
            </div>
            <div className="search center-block">
              <div className="input-group">
                  <span className="input-group-addon">
                      <i className="icon icon-search"/>
                  </span>
                <input type="text" className="form-control" placeholder="Username" aria-describedby="basic-addon1"/>
              </div>
            </div>
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
    const id = +this.props.id
    const url = '/blog/' + id
    const online = <i className="online"/>
    const more = 'user' === this.props.type ?
      <div>
        <Communicate id={id}/>
        <p className="center-block">{this.props.birthday}</p>
      </div> : <div>1<br/>2</div>
    return <div className="contact">
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

  render() {
    const invites = this.getSubscription('invite').map(invite => <Invite key={invite.id} {...invite}/>)
    return <ListHeader>
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

  render() {
    const list = this.renderList(this.getSubscription('invite'))
    return <div className="contact-list list">
      <div className="search"></div>
      {list}
    </div>
  }
}

export class Subscriptions extends List {
  componentWillReceiveProps(props) {
    const params = {}
    if (props.params && props.params.id) {
      params.recipient = +props.params.id
    }
    this.subscribe('subscriptions', params)
  }

  render() {
    const list = this.renderList(this.getSubscription('subscriptions'))
    return <div className="contact-list list">
      <div className="search"></div>
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

  render() {
    const list = this.renderList(this.getSubscription(this.state.blog ? 'blog' : 'from_list'))
    return <div className="contact-list list">
      <div className="search"></div>
      {list}
    </div>
  }
}
