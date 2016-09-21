import React, {Component} from 'react'
import {Blog, News} from '../../ui/blog/article'
import {AlertQueue} from '/imports/ui/common/alert'
import '/imports/stylesheets/main.scss'

Meteor.isMobile = Meteor.isCordova
  || navigator.userAgent.indexOf('iOS') > 0
  || navigator.userAgent.indexOf('Android') > 0

const dictionary = {
    'Settings': 'Настройки'
}

window.T = function (message) {
  return message in dictionary ? dictionary[message] : message
}

const app = Meteor.isMobile ? require('/imports/ui/mobile/app') : require('/imports/ui/app')
export const App = app.App

export const NoIndex = ({children, menu}) =>
  <noindex>{children}</noindex>

export class NotFound extends Component {
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

export class BrowserFeatures extends Component {
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

export class Root extends Component {
  render() {
    return <div id={Meteor.isMobile ? 'mobile' : 'desktop'}>
      {this.props.children}
      <AlertQueue/>
    </div>
  }
}

export const Unavailable = () => <div className="unavailable"/>
