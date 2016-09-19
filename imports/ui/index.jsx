import React, {Component} from 'react'
import {AdminRoute} from './admin/index'
import {AudioPlaylist} from './audio'
import {Blog, News} from './blog/article'
import {Edit, ChangePassword, ResetPassword} from './blog/edit'
import {Chat} from './blog/editor'
import {FileRoute} from './file'
import {Gallery, Visual} from './photo'
import {InviteList, FriendList, GroupsList, Subscriptions} from './list'
import {LoginPage} from './auth/login'
import {Messenger} from './message'
import {PhoneRoute} from './phone'
import {Route, IndexRoute} from 'react-router'
import {Signup} from './auth/signup'
import {VideoList} from './video'
import {AlertQueue} from '/imports/ui/common/alert'
import '/imports/stylesheets/main.scss'

Meteor.isMobile = Meteor.isCordova
  || navigator.userAgent.indexOf('iOS') > 0
  || navigator.userAgent.indexOf('Android') > 0
const app = Meteor.isMobile ? require('/imports/ui/mobile/app') : require('/imports/ui/app')

const NoIndex = ({children, menu}) =>
  <noindex>{children}</noindex>

class NotFound extends Component {
  resolveUrl() {
    Meteor.call('blog.get', {domain: location.pathname.slice(1)}, (err, res) => {
      if (res) {
        this.setState(res)
      }
    })
  }

  componentWillMount() {
    this.resolveUrl()
  }

  componentWillReceiveProps() {
    this.resolveUrl()
  }

  render() {
    if (this.state) {
      return <Blog {...this.state} />
    }
    else {
      return <div>Not Found</div>
    }
  }
}

class BrowserFeatures extends Component {
  render() {
    document.title = 'Browser Features'
    const features = {
      UserAgent: navigator.userAgent,
      WebRTC: window.RTCPeerConnection || window.webkitRTCPeerConnection ? 'Yes' : 'No',
      MediaRecorder: window.MediaRecorder ? 'Yes' : 'No'
    }
    const rows = _.map(features, (v, k) => <tr>
      <td>{k}</td>
      <td>{v}</td>
    </tr>)
    return (
      <table>
        <tbody>
        {rows}
        </tbody>
      </table>
    )
  }
}

class Root extends Component {
  render() {
    return <div id={Meteor.isMobile ? 'mobile' : 'desktop'}>
      {this.props.children}
      <AlertQueue/>
    </div>
  }
}

const Unavailable = () => <div className="unavailable"/>

export const RootRoute =
  <Route path='/' component={Root}>
    <IndexRoute component={BrowserFeatures}/>
    <Route component={app.App}>
      <Route path="messenger" component={Messenger}/>
      <Route path="news" component={News}/>
      <Route path="dialog/:peer" component={Messenger}/>
      <Route path="profile" component={Blog}/>
      <Route path="blog/:id" component={Blog}/>
      <Route path="invites" component={InviteList}/>
      <Route path="gallery/:id" component={Gallery}/>
      <Route path="image/:id" component={Visual}/>
      <Route path="video-search" component={VideoList}/>
      <Route path="player" component={AudioPlaylist}/>
      <Route path="settings" component={Edit}/>
      <Route path="edit/:id" component={Edit}/>
      <Route path="change-password" component={ChangePassword}/>
      <Route path="friends/:id" component={FriendList}/>
      <Route path="friends" component={FriendList}/>
      <Route path="groups" component={GroupsList}/>
      <Route path="subscriptions" component={Subscriptions}/>
      <Route path="subscriptions/:id" component={Subscriptions}/>
      <Route path="groups/:id" component={GroupsList}/>
      <Route path="unavailable" component={Unavailable}/>
      <Route path="chat/:id/edit" component={Chat}/>
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      <Route path="login" component={LoginPage}/>
      <Route path="signup" component={Signup}/>
      <Route path="reset-password" component={ResetPassword}/>
    </Route>
    {AdminRoute}
    {PhoneRoute}
    <Route path="*" component={NotFound}/>
  </Route>
