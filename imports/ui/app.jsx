import React, {Component} from 'react'
import {Link} from 'react-router'
import {AudioPlaylist} from './audio'
import {VideoList} from './video'
import {DialogList, Dialog} from './message'
import {FriendList, GroupsList} from './list'
import {AlertQueue} from '/imports/ui/common/alert'

class Panel extends Component {
  static generateId() {
    return '_' + Date.now()
  }

  render() {
    return <div className="panel-block" id={this.props.id}>
      <div className="panel-bar">
        <span className="icon icon-statusbar-close" onClick={this.props.close}/>
      </div>
      <div className="panel-content">{this.props.children}</div>
    </div>
  }
}

class Aside extends Component {
  componentWillMount() {
    this.state = {}
  }

  openPanel(content, id) {
    this.closeAll()
    id = id || Panel.generateId()
    this.setState({[id]: <Panel key={id} id={id} close={() => this.closePanel(id)}>{content}</Panel>})
    return id
  }

  openMessages = (peer, panelId) => {
    panelId = panelId || Panel.generateId()
    if (peer) {
      this.openPanel(<Dialog {...peer}/>, panelId)
    }
    else {
      this.openPanel(<DialogList open={peer => this.openMessages(peer, panelId)}/>, panelId)
    }
  }

  getPanels() {
    return _.filter(this.state, (v, k) => v && '_' === k[0])
  }

  closePanel = (id) => {
    this.setState({
      [id]: false,
      expand: false
    })
  }

  closeAll() {
    const state = {}
    _.forEach(this.state, (v, k) => {
      if (v && '_' === k[0]) {
        state[k] = false
      }
    })
    this.setState(state)
  }

  onClickMenuItem = (e) => {
    const c = e.target.classList
    if (c.contains('messages')) {
      this.openMessages()
    }
    else if (c.contains('video')) {
      this.openPanel(<VideoList/>)
    }
    else if (c.contains('audio')) {
      this.openPanel(<AudioPlaylist/>)
    }
    else if (c.contains('friends')) {
      this.openPanel(<FriendList tiny={true}/>)
    }
    else if (c.contains('groups')) {
      this.openPanel(<GroupsList params={{id: Meteor.userId()}}/>)
    }
    this.setState({menu: false})
  }

  onClickExpand = () => {
    this.setState({
      expand: true,
      menu: true
    })
  }

  render() {
    return <aside id={this.props.id} className={this.state.expand ? 'expand' : ''}>
      <div className="stripe" onClick={this.onClickExpand}/>
      <div className="panel-container">
        <ul className={'menu ' + (this.state.menu ? 'visible' : '')}>
          <li className="messages" onClick={this.onClickMenuItem}>Messages</li>
          <li className="video" onClick={this.onClickMenuItem}>Video</li>
          <li className="audio" onClick={this.onClickMenuItem}>Audio</li>
          <li className="friends" onClick={this.onClickMenuItem}>Friends</li>
          <li className="groups" onClick={this.onClickMenuItem}>Groups</li>
        </ul>
        {this.getPanels()}
      </div>
    </aside>
  }
}

export class App extends Component {
  render() {
    return <section role="main">
      <Aside id="left" className="vertical-panel"/>
      <div id="central" className="vertical-panel">{this.props.children}</div>
      <Aside id="right" className="vertical-panel"/>
      <nav id="menu" role="navigation">
        <div className="bar center-block">
          <Link to="/news" className="menu menu-news" title="News"/>
          <Link to="/profile" className="menu menu-profile" title="Profile"/>
          <Link to="/messenger" className="menu menu-message" title="Messenger"/>
          <Link to="/invites" className="menu menu-feedback" title="Feedback" />
          <Link to="/unavailable" className="menu menu-phone" title="Call"/>
          <Link to={'/friends/' + Meteor.userId()} className="menu menu-friends" title="Friends"/>
          <Link to={'/groups/' + Meteor.userId()} className="menu menu-group" title="Groups"/>
          <Link to={'/gallery/' + Meteor.userId()} className="menu menu-photo" title="Photos"/>
          <Link to={`/blog/${Meteor.userId()}/video`} className="menu menu-video" title="Videos"/>
          <Link to={`/blog/${Meteor.userId()}/audio`} className="menu menu-music" title="Music"/>
          <Link to="/settings" className="menu menu-settings" title="Settings"/>
        </div>
      </nav>
    </section>
  }
}

//
// <Link to="/video" className="menu menu-movie" title="Movies"/>
