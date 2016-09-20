import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import '/imports/stylesheets/signup.scss'

export class Login extends Component {
  onChange = (e) => {
    this.setState({
      [e.target.getAttribute('name')]: e.target.value
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    Meteor.loginWithPassword(this.state.login, this.state.password, () => {
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
      else {
        this.setState({})
      }
    })
  }

  render() {
    return <form className="login" method="post" onSubmit={this.onSubmit}>
      <div>
        <div className="credentials">
          <input type="text" className="form-control" name="login" placeholder="Login"
                 onChange={this.onChange}/>
          <input type="password" className="form-control" name="password" placeholder="Password"
                 onChange={this.onChange}/>
        </div>
        <div className="options">
          <div>
            <input type="checkbox" id="checkbox"/>
            Remember me
          </div>
          <Link to="/recovery">Forgot password?</Link>
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
    <div className="container">
      <div className="row">
        <div className="col-sm-4 col-lg-6">
          <div className="randomIcons"></div>
          <div className="copyrights">
            <p>&copy; 2015-2016 Evart Systems Incorporated.</p>
            <p>All rights reserved.</p>
            <p>Part of the <a href="http://evartcorp.com/">Evart</a> corporation.</p>
          </div>
        </div>
        <div className="col-sm-8 col-lg-6">
          <div className="row text-center">
            <h4>Download the App</h4>
            <p>Application available</p>
          </div>
          <div className="row text-center">
            <a href="#" className="appbtn appbtn-App-Store"/>
            <a href="#" className="appbtn appbtn-Google-Play"/>
          </div>
        </div>
      </div>
    </div>
  </footer>

export const LoginPage = () => <div id="login-page" className="auth">
  <main>
    <Login/>
    <img id="welcome" src="/images/join-welcome.png"/>
    <Link className="btn-join login-page-button" to="/signup">Join now</Link>
  </main>
  <Footer/>
</div>
