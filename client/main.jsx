import React from 'react'
import {render} from 'react-dom'
import {Meteor} from 'meteor/meteor'
import {Router, Route, browserHistory} from 'react-router'
import {Messenger} from './ui/message'
import './main.css'

const App = ({children, menu}) => (
  <div>
    <nav>{menu}</nav>
    <article>{children}</article>
  </div>
)

const About = () => <div>Evart Social Network</div>

function $tag(name, attributes, children) {
  var tag = document.createElement(name)
  if ('string' === typeof attributes) {
    tag.value = attributes
  }
  else {
    _.each(attributes, function (value, name) {
      if ('boolean' === typeof value) {
        tag[name] = value
      }
      else {
        tag.setAttribute(name, value)
      }
    })
  }
  if ('string' === typeof children) {
    tag.innerHTML = children
  }
  else if (children) {
    tag.append(children)
  }
  return tag
}

Meteor.startup(function () {
  // document.head.appendChild($tag('link', {
  //   rel: 'stylesheet',
  //   type: 'text/css',
  //   href: '/main.css'
  // }))
  document.body.appendChild($tag('div', {id: 'root'}))

  render(
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <Route path='about' component={About}/>
        <Route path='messenger' component={Messenger}/>
        <Route path='dialog/:peer' component={Messenger}/>
      </Route>
    </Router>
    , root)
})
