import React, {Component} from 'react'
import {Subscriber, Search, ScrollArea} from '/imports/ui/common/widget'

class AddExternalVideo extends Component {
  componentWillMount() {
    this.state = {}
  }

  onChangeURL = (e) => {
    const url = e.target.value
    Meteor.call('oembed.get', {url: url}, (err, res) => {
      if (err) {
        console.error(err)
      }
      else {
        res.url = url
        this.setState(res)
      }
    })
  }

  onClickAdd = () => {
    Meteor.call('external.add', {url: this.state.url}, (err, res) => {
      if (err) {
        console.error(err)
      }
      else {
        this.props.done(res)
      }
    })
  }

  render() {
    const button = this.state.html ? <button onClick={this.onClickAdd}>✔</button> : ''
    return <div className="add-external-video">
      <div className="video-url">
        <input placeholder="URL" onChange={this.onChangeURL}/>
        {button}
      </div>
      <div className="frame-container" dangerouslySetInnerHTML={{__html: this.state.html}}/>
    </div>
  }
}

export class VideoList extends Subscriber {
  onClickAdd = () => {
    this.setState({add: true})
  }

  open(file) {
    this.setState({current: file.data})
  }

  videoAdded = () => {
    this.setState({add: false})
  }

  search = (string) => {
    this.subscribe('file', {type: 'video', order: {id: -1}, search: string})
  }

  componentWillMount() {
    this.state = {}
    this.subscribe('file', {type: 'video', order: {id: -1}})
  }

  render() {
    const current = this.state.current
      ? <div className="current-video" dangerouslySetInnerHTML={{__html: this.state.current.html}} ref={el => {
      if (el) {
        el.removeAttribute('width')
        el.removeAttribute('height')
      }
    }
    }/>
      : ''
    const videos = this.getSubscription('file').map(file => <li key={file.id} onClick={this.open.bind(this, file)}>
      <img src={file.thumb}/>
      <p>{file.name}</p>
    </li>)
    const add = this.state.add ? <AddExternalVideo done={this.videoAdded}/> : ''
    return <div className="video player">
        {current}
        <Search search={this.search} label="Search video...">
          <button className="add" onClick={this.onClickAdd}>
            <div className="center">+</div>
          </button>
        </Search>
        {add}
        <div className="playlist-container">
          <ScrollArea>{videos}</ScrollArea>
        </div>
      </div>
  }
}
