import React, {Component} from 'react'

export class Blog extends Component {
  componentWillMount() {
    Meteor.call('blog.get', params, (err, res) => {
      this.setState(res)
    })
  }

  render() {
    const dialog = new Dialog(this.state)
    return (
      <section>
        <div>{this.name}</div>
        {dialog}
      </section>
    )
  }
}
