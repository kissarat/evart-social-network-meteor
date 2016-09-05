import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import {RootRoute} from './ui/index'
import './main.css'

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

Meteor.startup(function () {
  document.body.appendChild($tag('div', {id: 'root'}))

  render(
    <Router history={browserHistory}>
      {RootRoute}
    </Router>
    , root)

  if (Meteor.isClient && !Meteor.isCordova) {
    require('./ui/peer').peerStartup()
  }
})
