import React, {Component} from 'react'
import {Route, IndexRoute} from 'react-router'
import {MessageRoute} from './message'
import {AdminRoute} from './admin/index'
import {FileRoute} from './file'
import {AuthRoute} from './auth'
import {PhoneRoute} from './phone'

const App = ({children, menu}) =>
  <div>
    <nav>{menu}</nav>
    <div>{navigator.userAgent}</div>
    <article>{children}</article>
  </div>

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
      {MessageRoute}
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      {AuthRoute}
    </Route>
    {AdminRoute}
    {PhoneRoute}
    <Route path="*" component={NotFound}/>
  </Route>
