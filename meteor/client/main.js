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



  // setTimeout(function () {
  //   location.reload()
  // }, 3600 * 1000)
})
