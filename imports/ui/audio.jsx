import React, {Component} from 'react'
import {Subscriber} from './common/widget'
import Dropzone from 'react-dropzone'
import {upload, bucketFile} from './common/helpers'

class Audio extends Component {
  render() {
    const meta = this.props.data.metadata
    const track = this.props.active
      ? <span className="play"/>
      : <span className="number">{meta.track}</span>
    return <li onClick={this.props.onClick} className={this.props.active ? 'active' : ''}>
      <div className="order" data-order="1">{track}</div>
      <div className="title">{meta.artist} - {meta.title}</div>
      <div className="more">&bull;&bull;&bull;</div>
    </li>
  }
}

class Player extends Component {
  setup(props) {
    this.audio.src = bucketFile(props.id)
  }

  componentWillMount() {
    this.state = {}
    const audio = document.createElement('audio')
    this.setup(this.props)
  }

  componentWillReceiveProps(props) {
    this.setup(props)
  }

  onTimeUpdate = () => {
    this.setState({time: this.audio.currentTime})
  }

  onLoadedMetadata = () => {
    this.setState({loaded: true})
    Meteor.call('blog.update', {id: Meteor.userIdInt()}, {playing: this.props.id})
  }

  onSeek = (e) => {
    this.setState({time: +e.target.value})
  }

  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  play = () => {
    this.setState({playing: this.audio.paused})
    if (this.audio.paused) {
      this.audio.play()
    }
    else {
      this.audio.pause()
    }
  }

  render() {
    const meta = this.props.data.metadata
    if (this.state.loaded) {
      return <div className="media-container">
        <audio
          src={bucketFile(props.id)}
          onTimeUpdate={this.onTimeUpdate}
          onLoadedMetadata={this.onLoadedMetadata}
          onSeeked={this.onSeek}
        />
        <div className="background">
          <div style={{backgroundImage: 'url("/images/video-poster.jpg")'}}/>
        </div>

        <div className="media-poster text-center">
          <div className="title">
            <h3>{meta.title}</h3>
          </div>
          <div className="poster-container">
            <div className="poster" style={{backgroundImage: 'url("/images/video-poster.jpg")'}}></div>
          </div>
        </div>

        <div className="media-overlay">
          <div className="ctrl ctrl-title">
            <h3>{meta.artist}</h3>
            <p>{meta.album}</p>
          </div>
          <div className="ctrl ctrl-favorite">
            <span className="star-five"/>
          </div>
          <div className="ctrl ctrl-more">
            <span>&bull;&bull;&bull;</span>
          </div>
        </div>

        <div className='media-controls'>
          <div className="ctrl ctrl-play" onClick={this.play}>
            <span className={this.audio.paused ? 'play' : 'pause'}/>
          </div>
          <div className="ctrl ctrl-volume">
            <input type="range"/>
          </div>
          <div className="ctrl ctrl-progress">
            <input type="range"
                   step="1"
                   min="0"
                   value={this.audio.currentTime}
                   max={this.audio.duration}
                   onChange={this.onSeek}/>
          </div>
          <div className="ctrl ctrl-repeat">
            <span className="repeat"/>
          </div>
        </div>
      </div>
    }
    else {
      return <div></div>
    }
  }
}

export class AudioPlaylist extends Subscriber {
  componentWillMount() {
    this.state = {}
    this.subscribe('file', {type: 'audio', order: {id: -1}})
  }

  onClickAdd = (e) => {
    this.setState({upload: true})
  }

  onDrop = (files) => {
    Promise.all(files.map(upload)).then(() => this.setState({upload: false}))
  }

  render() {
    const files = this.getSubscription('file').map(file =>
      <Audio
        key={file.id}
        {...file}
        onClick={() => this.setState({active: file})}
        active={file == this.state.active}/>)
    const player = this.state.active ? <Player {...this.state.active}/> : ''
    return <div className="player container audio">
      {player}
      <div className="playlist-container">
        <div className="input-group">
          <span className="input-group-addon">
            <i className="icon icon-search"/>
          </span>
          <input type="text" className="form-control" placeholder="Search music..." onChange={this.onChange}/>
          <span className="input-group-addon">
            <span className="addfile" onClick={this.onClickAdd}>+</span>
          </span>
        </div>
        <div className="playlist">
          <Dropzone className={'uploader' + (this.state.upload ? '' : ' hide')} onDrop={this.onDrop}>
            <div className="upload-zone">
              <div className="dropZone">
                <div className="upload"/>
                <div>Drop audio file here</div>
              </div>
              <button type="button" className="btn upload">Upload</button>
            </div>
            <div className="progressBar-container">
              <div className="progressBar">
                <div className="uploader-content">
                  <div className="prgbar">
                    <div className="progress">
                      <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45"
                           aria-valuemin="0" aria-valuemax="100">
                        <span className="sr-only">45% Complete</span>
                      </div>
                    </div>
                  </div>
                  <div className="status">
                    65% from 3 Mb loaded
                  </div>
                  <div className="options">
                    <span className="settings"/>
                  </div>
                </div>
              </div>
            </div>
          </Dropzone>
          <ul>{files}</ul>
        </div>
      </div>
    </div>
  }
}
