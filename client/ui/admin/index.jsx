import React from 'react'
import {Route} from 'react-router'
import {UserRoute} from './user'

export const About = () => <div>About Admin Panel</div>

export const AdminRoute =
  <Route path='admin'>
    <Route path='about' component={About}/>
    {UserRoute}
  </Route>
