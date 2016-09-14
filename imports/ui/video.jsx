import React, {Component} from 'react'
import {Subscriber} from '/imports/ui/common/widget'

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

  videoAdded = () => {
    this.setState({add: false})
  }

  onSearch = (e) => {
    this.subscribe('file', {type: 'video', order: {id: -1}, search: e.target.value})
  }

  componentWillMount() {
    this.state = {}
    this.subscribe('file', {type: 'video', order: {id: -1}})
  }

  render() {
    const videos = this.getSubscription('file').map(file => <li key={file.id}>
      <img src={file.thumb}/>
      <p>{file.name}</p>
    </li>)
    const add = this.state.add ? <AddExternalVideo done={this.videoAdded}/> : ''
    return <div className="container">
      <div className="playlist-container">
        <div className="input-group">
          <span className="input-group-addon">
            <i className="icon icon-search"/>
          </span>
          <input type="search" className="form-control" placeholder="Search video..." onChange={this.onSearch}/>
          <span className="input-group-addon">
            <span className="addfile" onClick={this.onClickAdd}>+</span>
          </span>
        </div>
        {add}
        <div className="playlist">
          <ul>{videos}</ul>
        </div>
      </div>
    </div>
  }
}
