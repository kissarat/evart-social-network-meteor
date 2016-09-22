import React, {Component} from 'react'
import {render} from 'react-dom'
import {Router, Route, browserHistory} from 'react-router'
import {RootRoute} from '/imports/startup/client/main'
import {Meteor} from 'meteor/meteor'

// class Hello extends Component {
//   render() {
    {/*return <div>hello 2</div>*/}
  // }
// }

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
