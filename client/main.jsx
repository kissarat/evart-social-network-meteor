import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import {RootRoute} from '/imports/ui/index'
import '/imports/ui/index'

function $tag(name, attributes) {
  const tag = document.createElement(name)
  if ('string' === typeof attributes) {
    tag.value = attributes
  }
  else {
    _.each(attributes, function (value, key) {
      if ('boolean' === typeof value) {
        tag[key] = value
      }
      else {
        tag.setAttribute(key, value)
      }
    })
  }
  return tag
}

Meteor.userIdInt = function () {
  const userId = this.userId()
  return userId ? parseInt(userId, 36) : false
}

Meteor.startup(function () {
  document.body.appendChild($tag('div', {id: 'root'}))

  render(
    <Router history={browserHistory}>
      {RootRoute}
    </Router>
    , root)

  if (Meteor.userId() && !Meteor.isCordova) {
    require('/imports/ui/peer').peerStartup()
  }
})
