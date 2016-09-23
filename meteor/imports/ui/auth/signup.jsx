import React, {Component} from 'react'
import {Login, Footer} from './login'
import {InputGroup} from '/imports/ui/common/widget'
import {browserHistory} from 'react-router'
import '/imports/stylesheets/signup.scss'

export class Signup extends Component {
  componentWillReceiveParams(props) {
    this.state = {errors: {}}
    const state = _.pick(localStorage, 'sid', 'code', 'phone', 'domain')
    if (!_.isEmpty(state)) {
      this.setState(state)
    }
  }

  componentWillMount() {
    this.componentWillReceiveParams(this.props)
  }

  static step(number) {
    return <div className="step-label">
      <div className="number">{number}</div>
      <div className="text">Step</div>
    </div>
  }

  checkExistance = _.debounce((name, value) => {
    Meteor.call('exists', {[name]: value}, (err, res) => {
      if (res) {
        this.setError(name, res.exists ? 'User already registered' : '')
      }
    })
  }, 1000)

  onChange = (e) => {
    const name = e.target.getAttribute('name')
    const value = e.target.value

    this.setState({[name]: value})
    if (value.trim() && ['domain', 'phone', 'email'].indexOf(name) >= 0) {
      this.checkExistance(name, value)
    }
  }

  send(method, cb) {
    ['sid', 'code', 'phone', 'domain', 'surname', 'forename'].forEach((key) => {
      if (this.state[key]) {
        localStorage.setItem(key, this.state[key])
      }
    })
    Meteor.call(method, _.omit(this.state, 'errors'), cb)
    this.setState({errors: {}})
  }

  phone = () => {
    if (this.state.agree) {
      this.send('verify', (err, res) => {
        if (err) {
          this.setState({errors: {phone: err.reason}})
        }
        else if (res.success) {
          localStorage.setItem('sid', res.sid)
          this.setState({sid: res.sid})
          browserHistory.push('/signup/verify')
        }
        else {
          console.error(err, res)
        }
      })
    }
    else {
      this.setState({errors: {phone: 'You must accept license agreement'}})
    }
  }

  verify = () => {
    this.send('verify', (err, res) => {
      if (err) {
        this.setState({errors: {phone: err.reason}})
      }
      else if (res.success) {
        browserHistory.push('/signup/about')
      }
    })
  }

  setError(name, error) {
    this.setState({errors: {[name]: T(error)}})
  }

  onSubmit = (e) => {
    e.preventDefault()
    if (!/^[_\.\-\w]{4,24}$/g.test(this.state.domain)) {
      this.setError('domain',
        'The username should contain only letters, numbers and the following characters: "-", "_" and "."')
    }
    else if (!this.state.password || this.state.password.length < 6) {
      this.setError('password', 'Password must contain at least six alphanumeric characters')
    }
    else if (this.state.password !== this.state.repeat) {
      this.setError('repeat', 'Password does not match')
    }
    else if (this.state.email && !/\.+@\.+.\.+/) {
      this.setError('email', 'Email is invalid')
    }
    else if (!this.state.surname || this.state.surname.length < 2) {
      this.setError('surname', 'Last Name is required')
    }
    else if (!this.state.forename || this.state.forename.length < 2) {
      this.setError('forename', 'First Name is required')
    }
    else {
      Meteor.call('user.create', this.state, (err, state) => {
        if (err) {
          console.error(err)
          _.each(JSON.parse(err.details), (value, key) => {
            this.setState({errors: {[key]: value}})
          })
        }
        else if (state.success) {
          browserHistory.push('/login')
        }
        else {
          console.error(err, state)
        }
      })
    }
  }

  render() {
    let step = location.pathname.split('/')[2]
    if (!('verify' === step || 'about' === step)) {
      step = 'phone'
    }
    return <div id="signup-page">
      <Login/>
      <main>
        <form method="post" className="signup" onSubmit={this.onSubmit}>
          <div className="title">
            <h1>Simple registration in 3 steps</h1>
            <h2>Fill all fields to register</h2>
          </div>
          <hr/>
          <div id="phone" className={'phone' === step ? 'active step' : 'step'}>
            {Signup.step(1)}
            <fieldset className="single">
              <InputGroup message={this.state.errors.phone}>
                <input type="text" className="form-control"
                       name="phone" placeholder="Phone"
                       onChange={this.onChange}/>
                <button type="button" className="btn btn-primary" onClick={this.phone}>Next</button>
              </InputGroup>
              <label className="agree">
                <input type="checkbox" name="agree"
                       onChange={this.onChange}/>
                I am accepting <a href="#" target="_blank">license agreement</a>
              </label>
            </fieldset>
          </div>
          <div id="verify" className={'verify' === step ? 'active step' : 'step'}>
            {Signup.step(2)}
            <fieldset className="single">
              <InputGroup message={this.state.errors.code}>
                <input type="text" className="form-control"
                       name="code" placeholder="Code"
                       onChange={this.onChange}/>
                <button type="button" className="btn btn-primary" onClick={this.verify}>Verify</button>
              </InputGroup>
            </fieldset>
          </div>
          <div id="about" className={'about' === step ? 'active step' : 'step'}>
            {Signup.step(3)}
            <fieldset>
              <InputGroup message={this.state.errors.domain}>
                <input className="form-control"
                       name="domain" placeholder="Login"
                       onChange={this.onChange}/>
              </InputGroup>
              <InputGroup message={this.state.errors.email}>
                <input className="form-control"
                       name="email" placeholder="Email"
                       onChange={this.onChange}/>
              </InputGroup>
              <InputGroup message={this.state.errors.password}>
                <input className="form-control"
                       name="password" placeholder="Password" type="password"
                       onChange={this.onChange}/>
              </InputGroup>
              <InputGroup message={this.state.errors.repeat}>
                <input className="form-control"
                       name="repeat" placeholder="Repeat Password" type="password"
                       onChange={this.onChange}/>
              </InputGroup>
              <InputGroup message={this.state.errors.surname}>
                <input className="form-control"
                       name="surname" placeholder="Last Name"
                       onChange={this.onChange}/>
              </InputGroup>
              <InputGroup message={this.state.errors.forename}>
                <input className="form-control"
                       name="forename" placeholder="First Name"
                       onChange={this.onChange}/>
              </InputGroup>
              <button type="submit">Signup</button>
            </fieldset>
          </div>
        </form>
      </main>
      <Footer/>
    </div>
  }
}
