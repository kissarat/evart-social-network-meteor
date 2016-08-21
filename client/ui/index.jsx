import React from 'react'
import {Route} from 'react-router'
import {MessageRoute} from './message'
import {AdminRoute} from './admin/index'
import {FileRoute} from './file'
import {AuthRoute} from './auth'

const App = ({children, menu}) =>
  <div>
    <nav>{menu}</nav>
    <article>{children}</article>
  </div>

const NoIndex = ({children, menu}) =>
  <noindex>{children}</noindex>

export const RootRoute =
  <Route path='/'>
    <Route component={App}>
      {MessageRoute}
      {FileRoute}
    </Route>
    <Route component={NoIndex}>
      {AuthRoute}
    </Route>
    {AdminRoute}
  </Route>
