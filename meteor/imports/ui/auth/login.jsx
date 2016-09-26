import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import '/imports/stylesheets/login.scss'

export class Login extends Component {
  onChange = (e) => {
    this.setState({
      [e.target.getAttribute('name')]: e.target.value
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    Meteor.loginWithPassword(this.state.login, this.state.password, (err) => {
      if (Meteor.userId()) {
        const blog = {id: Meteor.userId()}
        Meteor.call('blog.get', blog, (err1, res1) => {
          console.log(err1, res1)
          if (res1) {
            this.setState(blog)
            browserHistory.push('/profile')
          }
          else {
            blog.type = 'user'
            Meteor.call('blog.create', blog, (err2, res2) => {
              blog.id = res2.id
              this.setState(blog)
              browserHistory.push('/profile')
            })
          }
        })
      }
      else if (err) {
        Meteor.error(err.reason, 3000)
      }
    })
  }

  render() {
    return <form className="login" method="post" onSubmit={this.onSubmit}>
      <div>
        <div className="credentials">
          <input type="text" name="login" placeholder="Login"
                 onChange={this.onChange}/>
          <input type="password" name="password" placeholder="Password"
                 onChange={this.onChange}/>
        </div>
        <div className="options">
          <div className="remember">
            <input type="checkbox" id="checkbox"/>
            Remember me
          </div>
          <Link className="recovery" to="/recovery">Forgot password?</Link>
        </div>
      </div>
      <div>
        <button type="submit" className="login-page-button" onClick={this.onSubmit}>Sign in</button>
      </div>
    </form>
  }
}

export const Footer = () =>
  <footer>
    <div className="copyright">
      <p>&copy; 2015-2016 Evart Systems Incorporated.</p>
      <p>All rights reserved.</p>
      <p>Part of the <a href="http://evartcorp.com/">Evart</a> corporation.</p>
    </div>
    <div className="download">
      <div>
        <h4>Download the App</h4>
        <p>Application available</p>
      </div>
      <div>
        <a href="#" className="store-badge app-store">
          <img src="/images/app-store.png"/>
        </a>
        <a href="#" className="store-badge google-play">
          <img src="/images/google-play.png"/>
        </a>
      </div>
    </div>
  </footer>

export const LoginPage = () => <div id="login-page" className="auth">
  <main>
    <Login/>
    <div id="welcome"/>
    <Link className="btn-join login-page-button" to="/signup">Join now</Link>
  </main>
  <Footer/>
</div>
