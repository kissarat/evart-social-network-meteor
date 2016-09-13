import React, {Component} from 'react'
import {Link} from 'react-router'

class UserHeader extends Component {
  render() {
    const geo = this.props.geo ? <div><span className="icon icon-location"/>Kiev, Ukraine</div> : ''
    const status = this.props.status ? <p>{this.props.status}</p> : ''
    return <header>
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
  }
}

class GroupHeader extends Component {
  render() {
    const geo = this.props.geo ? <div><span className="icon icon-location"/>Kiev, Ukraine</div> : ''
    const status = this.props.status ? <p>{this.props.status}</p> : ''
    return <header>
      <div className="col-sm-2 square square-pink">
        <p className="count">1050</p>
        <p className="name">Audio</p>
      </div>
      <div className="col-sm-2 square"></div>
      <div className="col-sm-2 square square-image square-image-random-6"></div>
      <div className="col-sm-6 user-info">
        <h4>{this.props.name || 'Untitled'}</h4>
        {geo}
        {status}
      </div>
      <div className="col-sm-2 square square-image square-image-random-7"></div>
      <div className="col-sm-2 square square-skyblue">
        <p className="count">1.9m</p>
        <p className="name">Subscribers</p>
      </div>
      <div className="col-sm-2 square square-image square-image-random-8"></div>
      <div className="col-sm-2 square square-image square-image-random-9"></div>
      <div className="col-sm-2 square square-image square-image-random-10"></div>
      <div className="col-sm-2 square square-image square-image-random-11"></div>
      <div className="col-sm-2 square"></div>
      <div className="col-sm-2 square square-image square-image-random-12"></div>
      <div className="col-sm-2 square square-image square-image-music-2">
        <span className="expand">&bull;&bull;&bull;</span>
        <div className="track">
          <span className="track-name">Before we talked to much</span>
          <span className="track-time">3:25</span>
        </div>
      </div>
      <div className="col-sm-2 square square-green">
        <p className="count">35</p>
        <p className="name">Video</p>
      </div>
      <div className="col-sm-2 square square-blue">
        <p className="count">2072</p>
        <p className="name">Photo</p>
      </div>
      <div className="col-sm-2 square square-image square-image-random-13"></div>
    </header>
  }
}

export class BlogLayout extends Component {
  render() {
    const header = 'user' === this.props.type
      ? <UserHeader {...this.props}/>
      : <GroupHeader {...this.props}/>

    const widgets = 'user' === this.props.type ? [
      <button key='follow' className="add-friend">Add friend</button>,
      <div key='communicate' className="connect-menu">
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
    ] : [
      <button key='follow' className="add-group">Subscribe</button>,
      <div key='followers' className="subscribers">
        <div className="text-center"><a href="#">1 999 875</a> Subscribers</div>
        <div className="last-subscribers">
          <img src="img/profile-image.jpg" alt="..." className="img-circle"/>
          <img src="img/profile-image.jpg" alt="..." className="img-circle"/>
          <img src="img/profile-image.jpg" alt="..." className="img-circle"/>
          <img src="img/profile-image.jpg" alt="..." className="img-circle"/>
          <img src="img/profile-image.jpg" alt="..." className="img-circle"/>
        </div>
      </div>
    ]

    const page = [
      <div key='content' className="col-sm-4">
        <div className="row">
          <div className="user-block">
            <img src="/images/profile-image.jpg" alt="..." className="img-thumbnail"/>
            {widgets}
          </div>
        </div>
      </div>,
      <div key='panel' className="col-sm-8">
        <div className="row">
          <div className="wrapper">
            <div className="user-container">{this.props.children}</div>
          </div>
        </div>
      </div>
    ]
    if ('user' !== this.props.type) {
      page.reverse()
    }
    return <div className={'container blog' + (this.props.busy ? ' busy' : '')}>
      <div className="row">
        {header}
      </div>

      <div className="row wrap">
        <main>
          {page}
        </main>
      </div>
    </div>
  }
}
