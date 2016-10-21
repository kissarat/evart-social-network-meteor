import React, {Component} from 'react'
import {render} from 'react-dom'
import {Router, Route, browserHistory} from 'react-router'
import {RootRoute} from '/imports/startup/client/main'
import {introduceAgent} from '/imports/startup/client/base'
import {Meteor} from 'meteor/meteor'

Meteor.startup(function () {
  render(
    <Router history={browserHistory}>
      {RootRoute}
    </Router>
    , document.getElementById('app'))

  setTimeout(introduceAgent, 30 * 1000)

  if (window.RTCPeerConnection || window.webkitRTCPeerConnection) {
    setTimeout(function () {
      require('/imports/ui/rtc/peer').peerStartup()
    }, 300)
  }

  // setTimeout(function () {
  //   location.reload()
  // }, 3600 * 1000)
})

const globals = {
  request(url) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.addEventListener('load', resolve)
      xhr.addEventListener('error', reject)
      xhr.send(null)
    })
  }
}

_.each(globals, function (fn, name) {
  window[name] = fn
})
