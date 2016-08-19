import React from 'react'
import {Route} from 'react-router'
import {Messenger} from './message'
import {AdminRoute} from './admin/index'

const App = ({children, menu}) =>
  <div>
    <nav>{menu}</nav>
    <article>{children}</article>
  </div>

export const RootRoute =
  <Route path='/' component={App}>
    <Route path='messenger' component={Messenger}/>
    <Route path='dialog/:peer' component={Messenger}/>
    {AdminRoute}
  </Route>
