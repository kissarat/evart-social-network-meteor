import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import '/imports/stylesheets/join.scss'

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
    return <form className="form-inline center-block" id="loginform">
      <div className="form-group">
        <label className="sr-only" htmlFor="login">Email address</label>
        <input type="text" className="form-control" id="login" name="login" placeholder="Login"
               onChange={this.onChange}/>
        <span className="visible-xs-block">
          <span className="join join-mail"/>
        </span>
      </div>
      <div className="form-group">
        <label className="sr-only" htmlFor="password">Password</label>
        <input type="password" className="form-control" id="password" name="password" placeholder="Password"
               onChange={this.onChange}/>
        <span className="visible-xs-block">
          <span className="join join-lock"/>
        </span>
      </div>
      <button type="submit" className="btn" onClick={this.onSubmit}>Sign in</button>
      <div className="mt">
        <div className="form-group">
          <div className="chbox">
            <input type="checkbox" id="checkbox"/>
            <label htmlFor="checkbox">
              Remember me
            </label>
          </div>
        </div>
        <div className="form-group">
          <Link to="/recovery">Forgot password?</Link>
        </div>
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

export const LoginPage = () => <div id="login-page">
  <main>
    <div className="container">
      <div className="row">
        <div className="col-sm-offset-4 col-sm-8 col-md-offset-6 col-md-6 col-lg-7 col-lg-5">
          <Login/>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-offset-4 col-sm-8 col-md-offset-6 col-md-6 col-lg-7 col-lg-5">
          <img id="welcome" src="/images/join-welcome.png" className="img-responsive"/>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-offset-4 col-sm-8 col-md-offset-6 col-md-6 col-lg-7 col-lg-5">
          <Link className="btn-join" to="/signup">Join now</Link>
        </div>
      </div>
    </div>
  </main>
  <Footer/>
</div>
