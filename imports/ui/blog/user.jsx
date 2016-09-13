import React, {Component} from 'react'
import {Link} from 'react-router'

export class UserLayout extends Component {
  render() {
    const geo = this.props.geo ? <div><span className="icon icon-location"/>Kiev, Ukraine</div> : ''
    const status = this.props.status ? <p>{this.props.status}</p> : ''
    return <div className="container blog">
      <div className="row">
        <header>
          <div className="col-sm-6 user-info">
            <h4>{this.props.name || 'Untitled'}</h4>
            {geo}
            {status}
          </div>
          <div className="col-xs-6 col-sm-2 square square-pink">
            <p className="count">1050</p>
            <p className="name">Audio</p>
          </div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-1"></div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-music-1">
            <span className="expand">&bull;&bull;&bull;</span>
            <div className="track">
              <span className="track-name">Before we talked to much</span>
              <span className="track-time">3:25</span>
            </div>
          </div>
          <div className="col-xs-6 col-sm-2 square square-darkblue">
            <p className="count">983</p>
            <p className="name">Friends</p>
          </div>
          <div className="col-xs-6 col-sm-2 square square-skyblue">
            <p className="count">345</p>
            <p className="name">Subscribers</p>
          </div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-2"></div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-3"></div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-4"></div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-5"></div>
          <div className="col-xs-6 col-sm-2 square"></div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-6"></div>
          <div className="col-xs-6 col-sm-2 square square-orange">
            <p className="count">101</p>
            <p className="name">Groups</p>
          </div>
          <div className="col-xs-6 col-sm-2 square square-green">
            <p className="count">35</p>
            <p className="name">Группы</p>
          </div>
          <div className="col-xs-6 col-sm-2 square"></div>
          <div className="col-xs-6 col-sm-2 square square-image square-image-random-2"></div>
        </header>
      </div>

      <div className="row wrap">
        <main>
          <div className="col-sm-4">
            <div className="row">
              <div className="user-block">
                <img src="/images/profile-image.jpg" alt="..." className="img-thumbnail"/>
                <button className="add-friend">Add friend</button>
                <div className="connect-menu">
                  <Link to={'/dialog/' + this.props.id}>
                    <span className="icon icon-email"/>
                  </Link>
                  <a href="#">
                    <span className="icon icon-call"/>
                  </a>
                  <a href="#">
                    <span className="icon icon-video-call"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-8">
            <div className="row">
              <div className="wrapper">
                <div className="user-container">{this.props.children}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  }
}
