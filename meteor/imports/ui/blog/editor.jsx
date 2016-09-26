import React, {Component} from 'react'
import {Link} from 'react-router'
// import {ImageList} from '/imports/ui/photo'
import {VideoList} from '/imports/ui/video'
import {AudioPlaylist} from '/imports/ui/audio'
import {thumb, bucketFile, tag3name} from '/imports/ui/common/helpers'
import {Subscriber, ImageDropzone} from '/imports/ui/common/widget'

const emoji = `😃 😄 😉 😍 😘 😚 😳 😌 😜 😝 😒 😓 😞 😥 😭 😡 😷 👿 👽 💘 🌟 🎵 🔥 👍 👎 👌 👊 💋 🙏 👏 💪 🔒 🔓 🔑 💰 🚬 💣 🔫 💊 💉 ⚽ 🎯 🏆 🎩 💄 💎 🍹 🍺 🍴 🍭 🍦`
  .split(/\s+/);

export class ImageList extends Subscriber {
  componentWillReceiveProps(props) {
    this.subscribe('file', {
      from: Meteor.userId(),
      type: 'image',
      limit: 100
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    const images = this.getSubscription('file').map(file =>
      <div key={file.id} className="item">
        <div className="thumb"
             style={{backgroundImage: `url("${file.thumb}")`}}
             onClick={() => this.props.open(file)}
        />
      </div>)
    return <div className="photo-container">
      <div className="photos">
        <ImageDropzone className="upload-photo" relation="manage">Upload</ImageDropzone>
        {images}
      </div>
    </div>
  }
}

export class File extends Component {
  componentWillReceiveProps(props) {
    this.setState(props)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    switch (this.state.type) {
      case 'audio':
        return <div className="attachment-audio song">
          <div>{tag3name(this.props)}</div>
          <audio key={this.state.id} controls={true} src={bucketFile(this.state.id)}/>
        </div>
      case 'image':
        return <Link
          to={`/${this.props.type}/${this.props.id}`}
          key={this.props.id}
          className="thumb attachment-image"
          style={{backgroundImage: `url("${this.props.thumb}")`}}/>
      case 'video':
        return <Link
          to={`/${this.props.type}/${this.props.id}`}
          key={this.props.id}
          className="thumb attachment-video"
          style={{backgroundImage: `url("${this.props.thumb}")`}}>
          <div className="glyphicon glyphicon-play-circle"/>
        </Link>
    }
  }
}

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
      widget = <VideoList {...this.props} open={this.props.open}/>
    }
    else if ('audio' === this.state.type) {
      widget = <AudioPlaylist {...this.props} open={this.props.open}/>
    }
    else {
      widget = <ImageList {...this.props} open={this.props.open}/>
    }
    const list = this.props.list.map(file => <File key={file.id} {...file}/>)
    return <div className="attachment-block">
      <div className="attachment-list">{list}</div>
      <div className="attachment-bar">
        <div className="menu">
          <div className={"glyphicon glyphicon-picture " + ('image' === this.state.type ? 'active' : '')}
               data-name="image"
               onClick={this.onClickMenu}
               style={{display: 'node'}}/>
          <div className={"glyphicon glyphicon-play-circle " + ('video' === this.state.type ? 'active' : '')}
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
      const files = this.getAttachments()
      if (!_.isEmpty(files)) {
        data.files = files.map(file => file.id)
      }
      Meteor.call('message.create', data,
        (err, res) => {
          if (err) {
            console.error(err)
          }
          else {
            this.state = {}
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

  open = (file) => {
    this.setState({['file_' + Date.now()]: file})
  }

  getAttachments() {
    return _.filter(this.state, (v, k) => 0 === k.indexOf('file_'))
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
    const list = this.getAttachments()
    const attachment = this.state.attach ? <Attachment {...this.props} list={list} open={this.open}/> : ''
    const attach = 'wall' === this.props.type ?
      <div className="file" onClick={this.attach}>
        <div className="icon icon-attach"/>
      </div> : ''
    return <div className="editor">
      <form>
        {attach}
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
