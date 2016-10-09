import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import {DateField} from 'react-date-picker'
import 'react-date-picker/index.css'
import {InputGroup, Busy} from '/imports/ui/common/widget'

class UserEdit extends Component {
  componentWillReceiveProps(props) {
    this.setState(props)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  onChangeDate = (date) => {
    this.setState({birthday: date})
  }

  onSave = (e) => {
    e.preventDefault()
    Meteor.call('blog.update', {id: +this.props.id}, this.state, (err) => {
      if (!err) {
        browserHistory.push('/blog/' + this.props.id)
      }
    })
  }

  render() {
    return <form className="blog-edit settings" onSubmit={this.onSave} method="post">
      <h1>{T('Settings')}</h1>
      <div className="form-group">
        <label>{T('Last Name')}</label>
        <input name="surname"
               value={this.state.surname || ''}
               onChange={this.onChange}
               className="form-control"/>
      </div>
      <div className="form-group">
        <label>{T('First Name')}</label>
        <input name="forename"
               value={this.state.forename || ''}
               onChange={this.onChange}
               className="form-control"/>
      </div>
      <div className="form-group">
        <label>{T('Birthday')}</label>
        <DateField name="birthday"
                   dateFormat="YYYY-MM-DD"
                   value={this.state.birthday}
                   onChange={this.onChangeDate}
                   className="form-control"/>
      </div>
      <Link to="/change-password" type="button" className="btn btn-primary">{T('Change Password')}</Link>
      <button type="submit" className="btn btn-success">{T('Save')}</button>
    </form>
  }
}

class GroupEdit extends Component {
  componentWillReceiveProps(props) {
    const state = _.pick(props, 'name')
    state.error = {}
    this.setState(state)
  }

  componentWillMount() {
    this.state = {errors: {}}
    this.componentWillReceiveProps(this.props)
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  setError(name, message) {
    this.setState({errors: {[name]: message}})
  }

  onSave = (e) => {
    e.preventDefault()
    if ('string' !== typeof this.state.name || this.state.name.length < 4) {
      this.setError('name', 'Name must be at least 4 character')
    }
    else {
      Meteor.call('blog.update', {id: +this.props.id}, this.state, (err) => {
        if (!err) {
          browserHistory.push('/blog/' + this.props.id)
        }
      })
    }
  }

  render() {
    return <form className="blog-edit settings" onSubmit={this.onSave} method="post">
      <h1>{T('Group Settings')}</h1>
      <InputGroup label={T('Name')} message={this.state.errors.name}>
        <input value={this.state.name || ''} name="name" onChange={this.onChange}/>
      </InputGroup>
      <button type="submit" className="btn btn-success">{T('Save')}</button>
    </form>
  }
}

export class ChangePassword extends Component {
  componentWillReceiveProps(props) {
    this.setState({
      errors: {},
      sid: props.params.sid
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onSave = (e) => {
    e.preventDefault()
    if (this.state.password === this.state.repeat) {
      Meteor.call('changePassword', this.state.old, this.state.password, (err, res) => {
        console.log(err, res)
        if (err) {
          if (403 === err.error) {
            this.setState({errors: {old: err.reason}})
          }
          if (400 === err.error) {
            this.setState({errors: {password: err.reason}})
          }
        }
        else if (res.passwordChanged) {
          browserHistory.push('/settings')
        }
      })
    }
    else {
      this.setState({errors: {repeat: T('Confirm password does not match')}})
    }
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  render() {
    return <form className="container settings" onSubmit={this.onSave}>
      <h1>Change Password</h1>
      <InputGroup label={T('Old Password')} message={this.state.errors.old}>
        <input name="old"
               type="password"
               value={this.state.old || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <InputGroup label={T('New Password')} message={this.state.errors.password}>
        <input name="password"
               type="password"
               value={this.state.password || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <InputGroup label={T('Repeat Password')} message={this.state.errors.repeat}>
        <input name="repeat"
               type="password"
               value={this.state.repeat || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <button type="submit" className="btn btn-success">{T('Change')}</button>
    </form>
  }
}

export class ResetPasswordPhone extends Component {
  componentWillReceiveProps() {
    this.state = {errors: {}}
  }

  componentWillMount() {
    this.componentWillReceiveProps()
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  onSave = (e) => {
    e.preventDefault()
    this.setState({busy: true})
    Meteor.call('sendSMS', {phone: this.state.phone, existing: true}, (err, res) => {
      if (err) {
        this.setState({errors: {phone: err.reason}})
      }
      else if (res.success) {
        // this.setState({sid: res.sid})
        browserHistory.push('/reset-password/' + res.sid)
      }
      else {
        console.error(err, res)
      }
    })
  }

  render() {
    if (this.state.busy) {
      return <Busy/>
    }
    else {
      return <form className="reset settings" onSubmit={this.onSave}>
        <h1>Reset Password</h1>
        <InputGroup label="Phone" message={this.state.errors.phone}>
          <input name="phone"
                 value={this.state.phone || ''}
                 onChange={this.onChange}
                 className="form-control"/>
        </InputGroup>
        <button type="submit" className="btn btn-success">{T('Send SMS')}</button>
      </form>
    }
  }
}

export class ResetPassword extends Component {
  componentWillReceiveProps(props) {
    this.setState({
      errors: {},
      busy: true
    })
    Meteor.call('verificationExists', props.params, (err, res) => {
      if (err) {
        console.error(err)
      }
      else if (res.count > 0) {
        return this.setState({
          exists: true,
          busy: false
        })
      }
      alert(T('Something wrong happen'))
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onSave = (e) => {
    e.preventDefault()
    const code = this.state.code && this.state.code.replace(/[^\d]+/g, '')
    if (!code) {
      this.setState({errors: {code: 'Invalid code'}})
    }
    else if (this.state.password && this.state.password.trim()) {
      if (/\s+/.test(this.state.password)) {
        this.setState({errors: {password: 'Password cannot contain white spaces'}})
      }
      else if (this.state.password === this.state.repeat) {
        const where = {
          sid: this.props.params.sid,
          password: this.state.password,
          code
        }
        Meteor.call('verify', where, (err, res) => {
          if (err) {
            this.setState({errors: {code: err.reason}})
          }
          else if (res.success) {
            browserHistory.push('/login')
          }
          else {
            this.setState({errors: {code: 'Invalid code'}})
          }
        })
      }
      else {
        this.setState({errors: {repeat: T('Confirm password does not match')}})
      }
    }
    else {
      this.setState({errors: {password: T('Is required')}})
    }
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  render() {
    if (this.state.busy) {
      return <Busy/>
    }
    else if (this.state.exists) {
      return <form className="reset settings" onSubmit={this.onSave}>
        <h1>Change Password</h1>
        <InputGroup label={T('Code')} message={this.state.errors.code}>
          <input name="code"
                 value={this.state.code || ''}
                 onChange={this.onChange}
                 className="form-control"/>
        </InputGroup>
        <InputGroup label={T('New Password')} message={this.state.errors.password}>
          <input name="password"
                 type="password"
                 value={this.state.password || ''}
                 onChange={this.onChange}
                 className="form-control"/>
        </InputGroup>
        <InputGroup label={T('Repeat Password')} message={this.state.errors.repeat}>
          <input name="repeat"
                 type="password"
                 value={this.state.repeat || ''}
                 onChange={this.onChange}
                 className="form-control"/>
        </InputGroup>
        <button type="submit" className="btn btn-success">{T('Reset')}</button>
      </form>
    }
    else {
      return <div className="red">Password has been changed</div>
    }
  }
}

export class Edit extends Component {
  componentWillReceiveProps(props) {
    const id = props.params && props.params.id ? +props.params.id : Meteor.userId()
    Meteor.call('blog.get', {id: id, table: 'blog'}, (err, state) => {
      if (err) {
        Meteor.error(err.reason)
      }
      else {
        this.setState(state)
      }
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    if (this.state) {
      let edit = 'user' === this.state.type ? <UserEdit {...this.state}/> : <GroupEdit {...this.state}/>
      if ('manage' !== this.state.relation) {
        edit = <div>
          <h1>403</h1>
          <h2>Forbidden</h2>
        </div>
      }
      return <div className="edit">{edit}</div>
    }
    else {
      return <Busy/>
    }
  }
}
