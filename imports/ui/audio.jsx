import React, {Component} from 'react'
import {Subscriber} from './common/widget'

export class Player extends Subscriber {
  onChange = (e) => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  render() {
    return <div className="player container audio">
      <div className="media-container">
        <div className="background">
          <div style={{backgroundImage: 'url("/images/video-poster.jpg")'}}/>
        </div>

        <div className="video-wrap">
          <audio/>
        </div>
        <div className="media-poster text-center">
          <div className="title">
            <h3>Some song or album title</h3>
          </div>
          <div className="poster-container">
            <div className="poster" style={{backgroundImage: 'url("/images/video-poster.jpg")'}}></div>
          </div>
        </div>

        <div className="media-overlay">
          <div className="ctrl ctrl-title">
            <h3>Group name</h3>
            <p>Artist name here</p>
          </div>
          <div className="ctrl ctrl-favorite">
            <span className="star-five"/>
          </div>
          <div className="ctrl ctrl-more">
            <span>&bull;&bull;&bull;</span>
          </div>
        </div>

        <div className='media-controls'>
          <div className="ctrl ctrl-play">
            <span className="play"/>
          </div>
          <div className="ctrl ctrl-volume">
            <input type="range" min="0" max="1" step="0.1" value="0.5" onChange={this.onChange}/>
          </div>
          <div className="ctrl ctrl-progress">
            <input type="range" value="0" onChange={this.onChange}/>
          </div>
          <div className="ctrl ctrl-repeat">
            <span className="repeat"/>
          </div>
        </div>
      </div>

      <div className="playlist-container">
        <div className="input-group">
          <span className="input-group-addon">
            <i className="icon icon-search"/>
          </span>
          <input type="text" className="form-control" placeholder="Search music..." onChange={this.onChange}/>
          <span className="input-group-addon">
            <span className="addfile">+</span>
          </span>
        </div>
        <div className="playlist">
          <ul></ul>
          <div className="uploader hide">
            <form action="/upload.php">
              <button type="button" className="btn">Upload</button>
              <div className="dropZone">
                <span className="upload"/>
                Drop audio file here
              </div>
            </form>
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
          </div>
        </div>
      </div>
    </div>
  }
}
