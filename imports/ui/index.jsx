import React, {Component} from 'react'
import {Route, IndexRoute} from 'react-router'
import {MessageRoute} from './message'
import {AdminRoute} from './admin/index'
import {FileRoute} from './file'
import {AuthRoute} from './auth'
import {PhoneRoute} from './phone'

const App = ({children, menu}) =>
  <div>
    <nav>{menu}</nav>
    <div>{navigator.userAgent}</div>
    <article>{children}</article>
  </div>

const NoIndex = ({children, menu}) =>
  <noindex>{children}</noindex>

const NotFound = () => <div>Page not found</div>

class About extends Component {
  render() {
    // document.body.style.backgroundColor = 'black'
    return (
      <div>{navigator.userAgent}</div>
    )
  }
}

export const RootRoute =
  <Route path='/'>
    <IndexRoute component={About} />
    <Route component={App}>
      {MessageRoute}
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      {AuthRoute}
    </Route>
    {AdminRoute}
    {PhoneRoute}
    <Route path="*" component={NotFound} />
  </Route>
