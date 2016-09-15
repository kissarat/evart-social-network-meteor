import React, {Component} from 'react'
import {Link} from 'react-router'
import Dropzone from 'react-dropzone'
import {bucketFile, upload} from '/imports/ui/common/helpers'
import {Subscriber} from '/imports/ui/common/widget'

const Track = function({playing}) {
  if (playing) {
    const duration = playing.data.format.duration / 60
    return <div className="col-xs-6 col-sm-2 square square-image square-image-music-2">
      <span className="expand">&bull;&bull;&bull;</span>
      <div className="track">
        <span className="track-name">{playing.data.metadata.title}</span>
        <span
          className="track-time">{Math.round(duration) + ':' + Math.round(60 * (duration - Math.round(duration)))}</span>
      </div>
    </div>
  }
  else {
    return <div className="col-xs-6 col-sm-2 square square-image square-image-music-1"/>
  }
}

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
        <p className="count">{this.props.audio}</p>
        <p className="name">Audio</p>
      </div>
      <div className="col-xs-6 col-sm-2 square square-image square-image-random-1"></div>
      <Track {...this.props}/>
      <div className="col-xs-6 col-sm-2 square square-darkblue">
        <p className="count">{this.props.friends}</p>
        <p className="name">Friends</p>
      </div>
      <div className="col-xs-6 col-sm-2 square square-skyblue">
        <p className="count">{this.props.subscribers}</p>
        <p className="name">Subscribers</p>
      </div>
      <div className="col-xs-6 col-sm-2 square square-image square-image-random-2"></div>
      <div className="col-xs-6 col-sm-2 square square-image square-image-random-3"></div>
      <div className="col-xs-6 col-sm-2 square square-image square-image-random-4"></div>
      <div className="col-xs-6 col-sm-2 square square-image square-image-random-5"></div>
      <div className="col-xs-6 col-sm-2 square"></div>
      <div className="col-xs-6 col-sm-2 square square-image square-image-random-6"></div>
      <div className="col-xs-6 col-sm-2 square square-orange">
        <p className="count">{this.props.groups}</p>
        <p className="name">Groups</p>
      </div>
      <div className="col-xs-6 col-sm-2 square square-green">
        <p className="count">{this.props.video}</p>
        <p className="name">Videos</p>
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
        <p className="count">{this.props.audio}</p>
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
        <p className="count">{this.props.subscribers}</p>
        <p className="name">Subscribers</p>
      </div>
      <div className="col-sm-2 square square-image square-image-random-8"></div>
      <div className="col-sm-2 square square-image square-image-random-9"></div>
      <div className="col-sm-2 square square-image square-image-random-10"></div>
      <div className="col-sm-2 square square-image square-image-random-11"></div>
      <div className="col-sm-2 square"></div>
      <div className="col-sm-2 square square-image square-image-random-12"></div>
      <Track {...this.props}/>
      <div className="col-sm-2 square square-green">
        <p className="count">{this.props.video}</p>
        <p className="name">Video</p>
      </div>
      <div className="col-sm-2 square square-blue">
        <p className="count">{this.props.image}</p>
        <p className="name">Photo</p>
      </div>
      <div className="col-sm-2 square square-image square-image-random-13"></div>
    </header>
  }
}

const Communicate = ({id}) => <div key='communicate' className="connect-menu">
  <Link to={'/dialog/' + id}>
    <span className="icon icon-email"/>
  </Link>
  <a href="#">
    <span className="icon icon-call"/>
  </a>
  <a href="#">
    <span className="icon icon-video-call"/>
  </a>
</div>

class Subscribers extends Subscriber {
  setup(props) {
    this.subscribe('to_list', {to: props.id, limit: 5, order: {id: -1}})
  }

  componentWillMount() {
    this.state = {}
    this.setup(this.props)
  }

  componentWillReceiveProps(props) {
    this.setup(props)
  }

  render() {
    const subscribers = this.getSubscription('to_list').map(
      blog => <img src={thumb(blog.avatar)} alt="..." className="img-circle"/>
    )
    return <div key='followers' className="subscribers">
      <div className="text-center"><a href="#">{this.props.subscribers}</a> Subscribers</div>
      <div className="last-subscribers">{subscribers}</div>
    </div>
  }
}

export class BlogLayout extends Component {
  componentWillMount() {
    this.state = {}
  }

  onDrop(files) {
    upload(files[0]).then(data => {
      Meteor.call('blog.update', {id: Meteor.userIdInt()}, {avatar: data.id}, (err, res) => {
        if (err) {
          console.error(err)
        }
        else {
          this.setState({avatar: data.id})
        }
      })
    })
  }

  onClickFollow = (e) => {
    const params = {
      id: +this.props.id,
      relation: e.target.getAttribute('id')
    }
    Meteor.call('establish', params, (err, res) => this.setState({relation: params.relation}))
  }

  render() {
    const header = 'user' === this.props.type
      ? <UserHeader {...this.props}/>
      : <GroupHeader {...this.props}/>

    const relation = 'relation' in this.state ? this.state.relation : this.props.relation
    let follow
    if ('follow' === relation) {
      follow = <button className="add-friend" onClick={this.onClickFollow}>Unsubscribe</button>
    }
    else if ('user' === this.props.type) {
      follow = <button className="add-friend" id="follow" onClick={this.onClickFollow}>Add friend</button>
    }
    else {
      follow = <button className="add-group" id="follow" onClick={this.onClickFollow}>Subscribe</button>
    }
    const menu = 'user' === this.props.type
      ? <Communicate id={this.props.id}/>
      : <Subscribers {...this.props}/>
    const avatarId = this.state.avatar || this.props.avatar
    const avatarURL = avatarId ? bucketFile(avatarId) : '/images/profile-image.jpg'
    const avatar = Meteor.userIdInt() == this.props.id ?
      <Dropzone style={{}} onDrop={this.onDrop}>
        <img src={avatarURL} alt="..." className="img-thumbnail"/>
      </Dropzone>
      : <img src={avatarURL} alt="..." className="img-thumbnail"/>

    const page = [
      <div key='content' className="col-sm-4">
        <div className="row">
          <div className="user-block">
            {avatar}
            {follow}
            {menu}
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
