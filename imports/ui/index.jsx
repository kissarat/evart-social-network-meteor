import React, {Component} from 'react'
import {AdminRoute} from './admin/index'
import {App} from './app'
import {FileRoute} from './file'
import {LoginPage} from './auth/login'
import {Messenger} from './message'
import {PhoneRoute} from './phone'
import {Route, IndexRoute} from 'react-router'
import {Signup} from './auth/signup'
import {Blog} from './blog/article'

const NoIndex = ({children, menu}) =>
  <noindex>{children}</noindex>

const NotFound = () => <div>Page not found</div>

class BrowserFeatures extends Component {
  render() {
    document.title = 'Browser Features'
    const features = {
      UserAgent: navigator.userAgent,
      WebRTC: window.RTCPeerConnection || window.webkitRTCPeerConnection ? 'Yes' : 'No',
      MediaRecorder: window.MediaRecorder ? 'Yes' : 'No'
    }
    const rows = _.map(features, (v, k) => <tr><td>{k}</td><td>{v}</td></tr>)
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
      <Route path="dialog/:peer" component={Messenger}/>
      <Route path="profile" component={Blog}/>
      <Route path="blog/:id" component={Blog}/>
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
