import React, {Component} from 'react'
import {Route} from 'react-router'

export const About = () => <div>About UserAdmin</div>

export const UserRoute =
  <Route path='user'>
    <Route path='about' component={About} />
  </Route>
