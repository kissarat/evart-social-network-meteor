import React from 'react'
import {render} from 'react-dom'
import {Meteor} from 'meteor/meteor'
import {Router, Route, browserHistory} from 'react-router'
import {UserList} from './ui/User'
import {Dialog} from './ui/message'

const App = ({children, menu}) => (
  <div>
    <nav>{menu}</nav>
    <article>{children}</article>
  </div>
)

const About = () => <div>Evart Social Network</div>

Meteor.startup(function() {
  const root = document.createElement('div')
  root.setAttribute('id', 'root')
  document.body.appendChild(root)

  render(
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <Route path='about' component={About}/>
        <Route path='user' component={UserList}/>
        <Route path='dialog/:peer' component={Dialog}/>
      </Route>
    </Router>
  , root)
})
