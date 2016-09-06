import React from 'react'
import {Route} from 'react-router'
import {UserRoute} from './user'
import {Auth} from './auth'

const Admin = ({children, menu}) =>
  <div>
    <Auth/>
    <nav>{menu}</nav>
    <article>{children}</article>
  </div>

export const AdminRoute =
  <Route path='admin' component={Admin}>
    {UserRoute}
  </Route>
