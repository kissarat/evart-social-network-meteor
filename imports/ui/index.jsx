import React, {Component} from 'react'
import {AdminRoute} from './admin/index'
import {App} from './app'
import {FileRoute} from './file'
import {LoginPage} from './auth/login'
import {Messenger} from './message'
import {PhoneRoute} from './phone'
import {Route, IndexRoute, browserHistory} from 'react-router'
import {Signup} from './auth/signup'
import {Blog, News} from './blog/article'
import {InviteList} from './list'
import {Gallery, Visual} from './photo'
import {VideoList} from './video'
import {AudioPlaylist} from './audio'

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

export const RootRoute =
  <Route path='/'>
    <IndexRoute component={BrowserFeatures}/>
    <Route component={App}>
      <Route path="messenger" component={Messenger}/>
      <Route path="news" component={News}/>
      <Route path="dialog/:peer" component={Messenger}/>
      <Route path="profile" component={Blog}/>
      <Route path="blog/:id" component={Blog}/>
      <Route path="friends" component={InviteList}/>
      <Route path="gallery/:id" component={Gallery}/>
      <Route path="image/:id" component={Visual}/>
      <Route path="video-search" component={VideoList}/>
      <Route path="player" component={AudioPlaylist}/>
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      <Route path="login" component={LoginPage}/>
      <Route path="signup" component={Signup}/>
    </Route>
    {AdminRoute}
    {PhoneRoute}
    <Route path="*" component={NotFound}/>
  </Route>
