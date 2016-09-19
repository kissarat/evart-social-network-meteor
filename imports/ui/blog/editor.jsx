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
    const chatAdd = this.props.add ?
      <div className="chat-add" onClick={this.props.add}>
        <div className="icon icon-add"></div>
      </div> : ''
    return <form className="editor">
      <label htmlFor="file">
        <div className="icon icon-attach"/>
        <input type="file" name="file" id="file" className="hidden"/>
      </label>
      <textarea
        name="message"
        placeholder="Type your message..."
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        value={this.state.text}/>
      {chatAdd}
      <div className="emoji">
        <span className="icon icon-smile"/>
      </div>
      <button className="send" type="submit" onClick={this.onSubmit}>
        <div className="icon icon-send"/>
      </button>
    </form>
  }
}
