import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import {RootRoute} from '/imports/ui/index'
import '/imports/ui/index'

Meteor.userIdInt = function () {
  const userId = this.userId()
  return userId ? parseInt(userId, 36) : false
}

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
