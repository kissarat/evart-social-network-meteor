import React, {Component} from 'react'

export class NotFound extends Component {
  componentWillReceiveProps() {
    const route = location.pathname.slice(1)
    if (route.indexOf('/') < 0) {
      if (route) {
        Meteor.call('blog.get', {domain: route}, (err, res) => {
          if (res) {
            this.setState(res)
          }
        })
      }
      else {
        if (Meteor.userId()) {
          browserHistory.push('/profile')
        }
        else {
          browserHistory.push('/login')
        }
      }
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps()
  }

  render() {
    if (this.state) {
      return <Blog {...this.state} />
    }
    else {
      return <div>Not Found</div>
    }
  }
}
