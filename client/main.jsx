import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import {RootRoute} from '/imports/startup/client/main'
import {Meteor} from 'meteor/meteor'

if (Meteor.isClient) {
  console.log('Client code')
}

Meteor.startup(function () {
  render(
    <Router history={browserHistory}>
      {RootRoute}
    </Router>
    , document.getElementById('app'))

  // if (Meteor.userId() && !Meteor.isCordova) {
  //   require('/imports/ui/peer').peerStartup()
  // }
})
