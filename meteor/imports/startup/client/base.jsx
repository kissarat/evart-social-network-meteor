import React, {Component} from 'react'
import {browserHistory} from 'react-router'
import {AlertQueue} from '/imports/ui/common/alert'
import '/imports/stylesheets/main.scss'
import {map, each, sample, isObject, isEmpty} from 'underscore'

Meteor.isMobile = Meteor.isCordova
  || navigator.userAgent.indexOf('iOS') > 0
  || navigator.userAgent.indexOf('iPhone OS') > 0
  || navigator.userAgent.indexOf('Android') > 0

const dictionary = {
  'Settings': 'Настройки'
}

window.T = function (message) {
  return message in dictionary ? dictionary[message] : message
}

const app = Meteor.isMobile ? require('/imports/ui/mobile/app') : require('/imports/ui/app')
export const App = app.App

export class NoIndex extends Component {
  componentWillMount() {
    // if ('/' == location.pathname) {
    //   if (Meteor.userId()) {
    //     browserHistory.push('/profile')
    //   }
    //   else {
    //     browserHistory.push('/login')
    //   }
    // }
  }

  render() {
    return <noindex>{this.props.children}</noindex>
  }
}

function purify(object) {
  const pure = {}
  const keys = Object.keys(isEmpty(object) && Object !== object.constructor
    ? object.constructor.prototype
    : object)
  keys.forEach(function (k) {
    if (k.indexOf('on') < 0) {
      const v = object[k]
      if ('function' !== typeof v && 0 !== v) {
        pure[k] = isObject(v) ? purify(v) : v
      }
    }
  })
  return pure
}

const codecs = `
application/mp4
application/mp4; codecs=bogus
application/octet-stream
application/octet-stream; codecs=bogus
application/ogg
application/ogg; codecs=bogus
audio/3gpp
audio/3gpp2
audio/aac
audio/ac3
audio/aiff
audio/basic
audio/flac
audio/mid
audio/midi
audio/mp4
audio/mp4; codecs=bogus
audio/mpeg
audio/mpegurl
audio/ogg
audio/ogg; codecs=bogus
audio/ogg; codecs=flac
audio/ogg; codecs=speex
audio/ogg; codecs=vorbis
audio/wav
audio/wav; codecs=0
audio/wav; codecs=1
audio/wav; codecs=2
audio/wave
audio/wave; codecs=0
audio/wave; codecs=1
audio/wave; codecs=2
audio/webm
audio/webm; codecs=vorbis
audio/x-aac
audio/x-ac3
audio/x-aiff
audio/x-flac
audio/x-midi
audio/x-mpeg
audio/x-mpegurl
audio/x-pn-wav
audio/x-pn-wav; codecs=0
audio/x-pn-wav; codecs=1
audio/x-pn-wav; codecs=2
audio/x-wav
audio/x-wav; codecs=0
audio/x-wav; codecs=1
audio/x-wav; codecs=2
video/3gpp
video/3gpp2
video/3gpp; codecs="mp4v.20.8, samr"
video/avi
video/mp4
video/mp4; codecs="avc1.42E01E, mp4a.40.2"
video/mp4; codecs="avc1.4D401E, mp4a.40.2"
video/mp4; codecs="avc1.58A01E, mp4a.40.2"
video/mp4; codecs="avc1.64001E, mp4a.40.2"
video/mp4; codecs="mp4v.20.240, mp4a.40.2"
video/mp4; codecs="mp4v.20.8, mp4a.40.2"
video/mp4; codecs=bogus
video/mpeg
video/msvideo
video/ogg
video/ogg; codecs="dirac, vorbis"
video/ogg; codecs="theora, speex"
video/ogg; codecs="theora, vorbis"
video/ogg; codecs=bogus
video/quicktime
video/webm
video/webm; codecs="vp8, vorbis"
video/webm; codecs=vorbis
video/webm; codecs=vp8
video/webm; codecs=vp8.0
video/x-matroska; codecs="theora, vorbis"
video/x-mpeg
video/x-msvideo
`.split('\n')
  .filter(codec => codec.trim())
  .sort()

function boolify(value) {
  if (value) {
    return true
  }
  else {
    return undefined === value || null === value ? undefined : false
  }
}

function collectFeatures() {
  var now = new Date()
  const features = {
    Location: location.pathname + location.search,
    Agent: navigator.userAgent,
    WebRTC: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),
    MediaRecorder: !!(window.MediaRecorder),
    Time: now.toUTCString() + ' (' + now.getTime() + ')',
    Language: navigator.language,
    CookieEnabled: boolify(navigator.cookieEnabled),
    Width: innerWidth,
    Height: innerHeight,
    Platform: navigator.platform,
    DoNotTrack: boolify(navigator.doNotTrack),
    Online: boolify(navigator.onLine)
  }

  if (navigator.hardwareConcurrency) {
    features.Cores = navigator.hardwareConcurrency
  }

  if (navigator.vendor) {
    features.Vendor = navigator.vendor
  }

  if (navigator.languages) {
    features.Languages = navigator.languages.join(', ')
  }

  if (features.CookieEnabled && document.cookie) {
    features.Cookies = document.cookie
  }

  features.Screen = purify(screen)

  if (navigator.plugins) {
    var plugins = {}
    each(navigator.plugins, function (plugin) {
      var info = {}
      if (plugin.description) {
        info.Description = plugin.description
      }
      info.mime = map(plugin, function (mime) {
        return mime.type
      })
      info.mime = info.mime.join(', ')
      plugins[plugin.name] = info
    })
    features.Plugins = plugins
  }

  const video = document.createElement('video')
  features.Codecs = codecs.filter(codec => video.canPlayType(codec))

  if (window.MediaRecorder) {
    features.MediaRecorder = codecs.filter(c => MediaRecorder.isTypeSupported(c))
  }

  if (window.performance) {
    if (performance.memory) {
      features.Memory = purify(performance.memory)
    }
    if (performance.navigation) {
      features.Navigation = purify(performance.navigation)
    }
    if (performance.timing) {
      features.Timing = purify(performance.timing)
    }
  }

  return features
}

function JSON2DOM(params, inverse = {}) {
  return map(params, function (v, k) {
    if (isObject(v) && Object === v.constructor) {
      v = <div className="feature-object">{JSON2DOM(v, inverse[k])}</div>
    }
    if (v instanceof Array) {
      v = v.map(el => <div key={el}>{el}</div>)
      v = <div className="feature-array">{v}</div>
    }
    else if ('boolean' === typeof v) {
      const text = v ? 'Yes' : 'No'
      v = !!(inverse[k]) === v ? <div style={{color: 'red'}}>{text}</div> : text
    }
    else if ('number' === typeof v) {
      v = <div className="feature-number">{v}</div>
    }
    else if (!v) {
      v = <div style={{color: 'orange'}}>Unknown</div>
    }
    else {
      v = <div className="feature-string">{v}</div>
    }
    return <div key={k} className="table-row">
      <div>{k}</div>
      {v}
    </div>
  })
}

export const rootRedirect = () => {
  if (0 === location.pathname.indexOf('/agent') && Meteor.userId() && !this.props.params.id) {
    browserHistory.push('/agent/' + Meteor.userId())
  }
  else {
    setTimeout(function () {
      if (Meteor.userId()) {
        browserHistory.push('/profile')
      }
      else {
        browserHistory.push('/login')
      }
    }, 200)
  }
  return <div>Loading...</div>
}

export function introduceAgent() {
  if (navigator.cookieEnabled && window.crypto) {
    let cid = /cid=([\w+\/]{24})/.exec(document.cookie)
    if (!cid) {
      cid = new Uint8Array(18)
      crypto.getRandomValues(cid)
      cid = btoa(String.fromCharCode.apply(null, cid))
      cid = cid.replace(/[+\/]/g, function () {
        return sample('ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxy0123456789')
      })
      document.cookie = `cid=${cid}; path=/; expires=Tue, 01 Jan 2030 00:00:00 GMT`
      Meteor.call('agent.set', collectFeatures())
    }
  }
}

export class BrowserFeatures extends Component {
  render() {
    const features = JSON2DOM(collectFeatures(), {
      DoNotTrack: true
    })
    return <div className="features">{features}</div>
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
