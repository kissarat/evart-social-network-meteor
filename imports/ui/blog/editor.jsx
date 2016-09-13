import React, {Component} from 'react'

export class Editor extends Component {
  componentWillMount() {
    this.state = {}
  }

  onSubmit = (e) => {
    e.nativeEvent.preventDefault()
    this.send()
  }

  send = () => {
    const text = this.state.text.trim()
    if (text) {
      const data = {
        type: this.props.type,
        ['dialog' === this.props.type ? 'to' : 'parent']: +this.props.id,
        text: text
      }
      Meteor.call('message.create', data,
        (err, res) => {
          if (err) {
            console.error(err)
          }
          else {
            this.setState({text: ''})
          }
        })
    }
  }

  onChange = (e) => {
    this.setState({text: e.target.value})
  }

  onKeyPress = (e) => {
    if ('Enter' === e.nativeEvent.key) {
      this.setState({text: e.target.value})
      this.send()
    }
  }

  render() {
    const add = 'chat' === this.props.type ? <div className="add">
      <span className="icon icon-add"/>
    </div> : ''
    return <form className="message-block">
      <label htmlFor="file">
        <span className="icon icon-attach"/>
        <input type="file" name="file" id="file" className="hidden"/>
      </label>
      <textarea
        name="messsage"
        placeholder="Type your message..."
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        value={this.state.text}/>
      <div className="controls">
        {add}
        <div className="emoji">
          <span className="icon icon-smile"/>
        </div>
        <button className="send" type="submit" onClick={this.onSubmit}>
          <span className="icon icon-send"/>
        </button>
      </div>
    </form>
  }
}
