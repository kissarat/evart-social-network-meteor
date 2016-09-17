import React, {Component} from 'react'
import {Link} from 'react-router'
import '/imports/stylesheets/main.scss'
import {AudioPlaylist} from './audio'
import {VideoList} from './video'
import {DialogList, Dialog} from './message'

class Panel extends Component {
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
    id = id ? id : '_' + Date.now().toString(36)
    this.setState({[id]: <Panel key={id} id={id}>{content}</Panel>})
    return id
  }

  openMessages = (peer, panelId) => {
    if (peer) {
      this.openPanel(<Dialog {...peer}/>, panelId)
    }
    else {
      this.openPanel(<DialogList open={peer => this.openMessages(peer, panelId)}/>)
    }
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
          <li className="friends hidden" onClick={this.onClickMenuItem}>Friends</li>
          <li className="groups hidden" onClick={this.onClickMenuItem}>Groups</li>
        </ul>
        {_.filter(this.state, (v, k) => '_' === k[0])}
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
          <Link to="/notifications" className="menu menu-feedback" title="Feedback" data-content="3"/>
          <Link to="/messenger" className="menu menu-message" title="Messenger" data-content="123"/>
          <Link to="/call" className="menu menu-phone" title="Call"/>
          <Link to="/friends" className="menu menu-friends" title="Friends"/>
          <Link to="/groups" className="menu menu-group" title="Groups"/>
          <Link to={'/gallery/' + Meteor.userIdInt()} className="menu menu-photo" title="Photos"/>
          <Link to="/video-search" className="menu menu-video" title="Videos"/>
          <Link to="/video" className="menu menu-movie" title="Movies"/>
          <Link to="/player" className="menu menu-music" title="Music"/>
          <Link to="/settings" className="menu menu-settings" title="Settings"/>
        </div>
      </nav>
    </section>
  }
}

