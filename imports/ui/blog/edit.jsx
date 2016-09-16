import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import {DateField} from 'react-date-picker'
import 'react-date-picker/index.css'
import {InputGroup} from '/imports/ui/common/widget'
import _ from 'underscore'

class UserEdit extends Component {
  componentWillReceiveProps(props) {
  }

  componentWillMount() {
    this.state = {}
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
    return <form className="container blog-edit settings" onSubmit={this.onSave} method="post">
      <h1>Settings</h1>
      <div className="form-group">
        <label>Last Name</label>
        <input name="surname"
               value={this.state.surname || this.props.surname || ''}
               onChange={this.onChange}
               className="form-control"/>
      </div>
      <div className="form-group">
        <label>First Name</label>
        <input name="forename"
               value={this.state.forename || this.props.forename || ''}
               onChange={this.onChange}
               className="form-control"/>
      </div>
      <div className="form-group">
        <label>Birthday</label>
        <DateField name="birthday"
                   dateFormat="YYYY-MM-DD"
                   value={this.state.birthday || this.props.birthday}
                   onChange={this.onChangeDate}
                   className="form-control"/>
      </div>
      <Link to="/change-password" type="button" className="btn btn-primary">Change Password</Link>
      <button type="submit" className="btn btn-success">Save</button>
    </form>
  }
}

export class ChangePassword extends Component {
  componentWillMount() {
    this.state = {errors: {}}
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
      this.setState({errors: {repeat: 'Confirm password does not match'}})
    }
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  render() {
    return <form className="container settings" onSubmit={this.onSave}>
      <h1>Change Password</h1>
      <InputGroup label="Old Password" message={this.state.errors.old}>
        <input name="old"
               type="password"
               value={this.state.old || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <InputGroup label="New Password" message={this.state.errors.password}>
        <input name="password"
               type="password"
               value={this.state.password || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <InputGroup label="Repeat Password" message={this.state.errors.repeat}>
        <input name="repeat"
               type="password"
               value={this.state.repeat || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <button type="submit" className="btn btn-success">Change</button>
    </form>
  }
}

export class ResetPassword extends Component {
  componentWillMount() {
    this.state = {errors: {}}
  }

  onSave = (e) => {
    e.preventDefault()
    if (this.state.password === this.state.repeat) {
      Meteor.call('setPassword', this.state.password, (err, res) => {
        console.log(err, res)
      })
    }
    else {
      this.setState({errors: {repeat: 'Confirm password does not match'}})
    }
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  render() {
    return <form className="container settings" onSubmit={this.onSave}>
      <h1>Change Password</h1>
      <InputGroup label="Code" message={this.state.errors.old}>
        <input name="code"
               value={this.state.old || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <InputGroup label="New Password" message={this.state.errors.password}>
        <input name="password"
               value={this.state.password || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <InputGroup label="Repeat Password" message={this.state.errors.repeat}>
        <input name="repeat"
               value={this.state.repeat || ''}
               onChange={this.onChange}
               className="form-control"/>
      </InputGroup>
      <button type="submit" className="btn btn-success">Change</button>
    </form>
  }
}

export class Edit extends Component {
  componentWillReceiveProps(props) {
    const id = props.params && props.params.id ? +props.params.id : Meteor.userIdInt()
    Meteor.call('blog.get', {id: id, table: 'blog'}, (err, state) => {
      if (!err) {
        this.setState(state)
      }
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    if (this.state) {
      if ('manage' === this.state.relation) {
        return 'user' === this.state.type
          ? <UserEdit {...this.state}/>
          : <div>Not supported yet</div>
      }
      else {
        return <div>
          <h1>403</h1>
          <h2>Forbidden</h2>
        </div>
      }
    }
    else {
      return <div>Loading...</div>
    }
  }
}
