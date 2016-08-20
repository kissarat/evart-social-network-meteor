import React from 'react'
import {Route} from 'react-router'
import {Messenger} from './message'
import {AdminRoute} from './admin/index'
import {AuthRoute} from './auth'

const App = ({children, menu}) =>
  <div>
    <nav>{menu}</nav>
    <article>{children}</article>
  </div>

const NoIndex = ({children, menu}) =>
  <noindex>{children}</noindex>

export const RootRoute =
  <Route path='/' component={App}>
    <Route path='messenger' component={Messenger}/>
    <Route path='dialog/:peer' component={Messenger}/>
    <Route component={NoIndex}>
      {AuthRoute}
    </Route>
    {AdminRoute}
  </Route>
