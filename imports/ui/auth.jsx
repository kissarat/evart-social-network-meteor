import React, {Component} from 'react'
import {Route} from 'react-router'

export class Login extends Component {
  onChange = (e) => {
    this.setState({
      [e.target.getAttribute('name')]: e.target.value
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    Meteor.loginWithPassword(this.state.username, this.state.password, () => {
      if (Meteor.userId()) {
        const blog = {id: parseInt(Meteor.userId(), 36)}
        Meteor.call('blog.get', blog, (err1, res1) => {
          if (res1) {
            this.setState(blog)
          }
          else {
            blog.type = 'user'
            Meteor.call('blog.create', blog, (err2, res2) => {
              blog.id = res2.id
              this.setState(blog)
            })
          }
        })
      }
      else {
        this.setState({})
      }
    })
  }

  logout = () => {
    Meteor.logout(() => this.setState({}))
  }

  render() {
    return Meteor.userId() ?
      <button type="button" onClick={this.logout}>Logout</button>
      :
      <form onSubmit={this.onSubmit} method="post">
        <input name="username" onChange={this.onChange}/>
        <input name="password" type="password" onChange={this.onChange}/>
        <button type="submit">Login</button>
      </form>
  }
}

export const AuthRoute = [
  <Route key="login" path="login" component={Login}/>
]
