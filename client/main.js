import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import {RootRoute} from '/imports/ui/index'
import '/imports/ui/index'
import {Dispatcher} from 'flux'

Meteor.userIdInt = function () {
  const userId = this.userId()
  return userId ? parseInt(userId, 36) : false
}

Meteor.dispatcher = new Dispatcher()

Meteor.startup(function () {
  render(
    <Router history={browserHistory}>
      {RootRoute}
    </Router>
    , document.getElementById('root'))

  if (Meteor.userId() && !Meteor.isCordova) {
    require('/imports/ui/peer').peerStartup()
  }
})

let disconnectedAlert

Tracker.autorun(function () {
  if (Meteor.status().connected) {
    if (disconnectedAlert) {
      disconnectedAlert.close()
      disconnectedAlert = null
    }
    Meteor.dispatcher.dispatch({type: 'success', message: 'Connected', timeout: 3000})
  }
  else if (!disconnectedAlert) {
    Meteor.dispatcher.dispatch({
      type: 'danger', message: 'Connection lost', callback: function (alert) {
        disconnectedAlert = alert
      }
    })
  }
})
