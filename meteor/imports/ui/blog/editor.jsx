import React, {Component} from 'react'
// import {Gallery} from '/imports/ui/photo'
import {VideoList} from '/imports/ui/video'
import {AudioPlaylist} from '/imports/ui/audio'

const emoji = `😃 😄 😉 😍 😘 😚 😳 😌 😜 😝 😒 😓 😞 😥 😭 😡 😷 👿 👽 💘 🌟 🎵 🔥 👍 👎 👌 👊 💋 🙏 👏 💪 🔒 🔓 🔑 💰 🚬 💣 🔫 💊 💉 ⚽ 🎯 🏆 🎩 💄 💎 🍹 🍺 🍴 🍭 🍦`
  .split(/\s+/);

class Attachment extends Component {
  componentWillMount() {
    this.state = {}
  }

  onClickMenu = (e) => {
    this.setState({type: e.target.getAttribute('data-name')})
  }

  render() {
    let widget = ''
    if ('video' === this.state.type) {
      widget = <VideoList {...this.props} />
    }
    else if ('audio' === this.state.type) {
      widget = <AudioPlaylist {...this.props} />
    }
    else {
      // {/*widget = <Gallery {...this.props} />*/}
    }
    return <div className="attachment-block">
      <div className="attachment-list"></div>
      <div className="attachment-bar">
        <div className="menu">
          <div className={"glyphicon glyphicon-picture " + ('image' === this.state.type ? 'active' : '')}
               data-name="image"
               onClick={this.onClickMenu}/>
          <div className={"glyphicon glyphicon-play-circle "  + ('video' === this.state.type ? 'active' : '')}
               data-name="video"
               onClick={this.onClickMenu}/>
          <div className={"glyphicon glyphicon-music " + ('audio' === this.state.type ? 'active' : '')}
               data-name="audio"
               onClick={this.onClickMenu}/>
        </div>
        <div className="attachment-widget">{widget}</div>
      </div>
    </div>
  }
}

export class Editor extends Component {
  componentWillMount() {
    this.state = {text: ''}
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

  onClickEmoji = () => {
    this.setState({emoji: true})
  }

  insertEmoji = (smile) => {
    this.setState({
      text: this.state.text.slice(0, this.refs.text.selectionStart)
      + smile + this.state.text.slice(this.refs.text.selectionEnd),
      emoji: false
    })
  }

  attach = () => {
    this.setState({attach: true})
  }

  render() {
    const smiles = this.state.emoji
      ? emoji.map(smile => <span
      key={smile}
      onClick={() => this.insertEmoji(smile)}>{smile}</span>)
      : ''
    const chatAdd = this.props.add ?
      <div className="chat-add" onClick={this.props.add}>
        <div className="icon icon-add"></div>
      </div> : ''
    const attachment = this.state.attach ? <Attachment {...this.props}/> : ''
    return <div className="editor">
      <form>
        <div className="file" onClick={this.attach}>
          <div className="icon icon-attach"/>
        </div>
        <textarea
          ref="text"
          name="message"
          placeholder="Type your message..."
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          value={this.state.text}/>
        {chatAdd}
        <div className="emoji" onClick={this.onClickEmoji}>
          <span className="icon icon-smile"/>
        </div>
        <button className="send" type="submit" onClick={this.onSubmit}>
          <div className="icon icon-send"/>
        </button>
      </form>
      <div className="emoji-bar">{smiles}</div>
      {attachment}
    </div>
  }
}
