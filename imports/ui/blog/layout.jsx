import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import {upload} from '/imports/ui/common/helpers'
import {Subscriber, Avatar, ImageDropzone, Busy} from '/imports/ui/common/widget'

export const Track = function ({track, type}) {
  if (track) {
    const duration = track.data.format.duration / 60
    return <div className={`tile image ${type}-track`}>
      <div className="expand">&bull;&bull;&bull;</div>
      <div className="track">
        <span className="track-name">{track.data.metadata.title}</span>
        <span
          className="track-time">{Math.round(duration) + ':' + Math.round(60 * (duration - Math.round(duration)))}</span>
      </div>
    </div>
  }
  else {
    return <div className="col-xs-6 tile square-image square-image-music-1"/>
  }
}

export class Title extends Component {
  componentWillMount() {
    this.state = {}
  }

  onChangeStatus = (e) => {
    this.setState({status: e.target.value.slice(0, 140)})
  }

  onBlurStatus = (e) => {
    Meteor.call('blog.update', {id: this.props.id}, {status: this.state.status})
  }

  render() {
    const name = this.props.name ? <h4>{this.props.name}</h4> : <h4>Untitled</h4>
    const geo = this.props.geo ?
      <div><span className="icon icon-location"/>{this.props.geo.replace('\t', ',')}</div> : ''
    let status = this.state.status || this.props.status
    status = 'manage' === this.props.relation
      ? <textarea value={status}
                  rows={Meteor.isMobile ? 1 : 3}
                  placeholder="Status"
                  onChange={this.onChangeStatus}
                  onBlur={this.onBlurStatus}/>
      : <p>{status}</p>
    return <div className="blog-info">
      {name}
      {geo}
      {status}
    </div>
  }
}

export class Informer extends Component {
  render() {
    const props = this.props
    return <Link to={`/${props.name}/${props.id}`} className={'tile ' + props.name}>
      <p className="count">{props.count}</p>
      <p className="name">{props.label}</p>
    </Link>
  }

  static all(props) {
    return {
      audio: <Informer name="audio" count={props.audio} label="Audio" id={props.id}/>,
      friends: <Informer name="friends" count={props.friends} label="Friends" id={props.id}/>,
      subscribers: <Informer name="subscribers" count={props.subscribers} label="Subscribers" id={props.id}/>,
      groups: <Informer name="groups" count={props.groups} label="Groups" id={props.id}/>,
      video: <Informer name="video" count={props.video} label="Video" id={props.id}/>,
    }
  }
}

class ImageTile extends ImageDropzone {
  static all(props) {
    return _.range(0, 6)
      .map(i => {
        const imageProperty = 't' + i
        return <ImageDropzone
          imageId={props[imageProperty]}
          imageProperty={imageProperty}
          className={'tile image tile-' + i}
          onDrop={props.onDrop}
          relation={props.relation}
        />
      })
  }
}


class UserHeader extends Component {
  render() {
    const informers = Informer.all(this.props)
    const images = ImageTile.all(this.props)
    return <header className="user">
      <div>
        <Title {...this.props}/>
        {informers.audio}
        {images[0]}
        <Track {...this.props}/>
        {informers.friends}
        {informers.subscribers}
        {images[1]}
        {images[2]}
        {images[3]}
        {images[4]}
        <div className="tile empty"></div>
        {images[5]}
        {informers.groups}
        {informers.video}
        <div className="tile empty"></div>
        {images[6]}
      </div>
    </header>
  }
}

class GroupHeader extends Component {
  render() {
    const informers = Informer.all(this.props)
    const images = ImageTile.all(this.props)
    return <header className="group">
      <div>
        {informers.audio}
        <div className="tile empty"></div>
        {images[0]}
        <Title {...this.props}/>
        {images[1]}
        {informers.subscribers}
        {images[2]}
        {images[3]}
        {images[4]}
        {images[5]}
        <div className="tile empty"></div>
        {images[6]}
        <Track {...this.props}/>
        {informers.video}
        {informers.photo}
        {images[7]}
      </div>
    </header>
  }
}

export const Communicate = ({id}) => <div key='communicate' className="connect-menu">
  <Link to={'/dialog/' + id}>
    <span className="icon icon-email"/>
  </Link>
  <Link to="/unavailable">
    <span className="icon icon-call"/>
  </Link>
  <Link to="/unavailable">
    <span className="icon icon-video-call"/>
  </Link>
</div>

class Friends extends Subscriber {
  componentWillReceiveProps(props) {
    this.setState({busy: true})
    this.subscribe('invite', {
      id: props.id,
      type: 'user',
      relation: 'follow',
      random: true,
      limit: 3
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    if (this.state.busy) {
      return <div className="friends"><Busy/></div>
    }
    else {
      const list = this.getSubscription('invite')
        .map(friend => {
          const avatar = friend.avatar ? thumb(friend.avatar) : '/images/user.png'
          return <Link key={friend.from}
                       className="friend avatar"
                       to={'/blog/' + friend.from}
                       title={friend.name}
                       style={{backgroundImage: `url("${avatar}")`}}
          />
        })
      return <div className="friends">
        {list}
        <Link key='url' to={'/friends/' + this.props.id} className="friend count">More</Link>
      </div>
    }
  }
}

const ManagerMenu = ({id}) => <div className="connect-menu">
  <Link to={'/edit/' + id} href="#">
    <span className="icon icon-post"/>
  </Link>
  <Link to="/unavailable">
    <span className="icon icon-chart"/>
  </Link>
  <a href="#" onClick={() => Meteor.logout() && browserHistory.push('/login')}>
    <span className="icon icon-switch"/>
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
      blog => <img key={blog.id} src={thumb(blog.avatar)} alt="..." className="img-circle"/>
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

  onDrop = (files, e) => {
    const name = e.target.getAttribute('id') || e.target.parentNode.getAttribute('id')
    return upload(files[0]).then(data => {
      return new Promise((resolve, reject) => {
        Meteor.call('blog.update', {id: Meteor.userId()}, {[name]: data.id}, (err, res) => {
          if (err) {
            reject(err)
          }
          else {
            this.setState({[name]: data.id})
            resolve(res)
          }
        })
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
    if (Meteor.isMobile) {
      return <main>{this.props.children}</main>
    }
    else {
      const header = 'user' === this.props.type
        ? <UserHeader {...this.props} onDrop={this.onDrop}/>
        : <GroupHeader {...this.props} onDrop={this.onDrop}/>

      const relation = 'relation' in this.state ? this.state.relation : this.props.relation
      let follow
      if ('manage' === relation) {
        follow = <Friends/>
      }
      else if ('follow' === relation) {
        follow = <button className="add-friend" onClick={this.onClickFollow}>Unsubscribe</button>
      }
      else if ('user' === this.props.type) {
        follow = <button className="add-friend" id="follow" onClick={this.onClickFollow}>Add friend</button>
      }
      else {
        follow = <button className="add-group" id="follow" onClick={this.onClickFollow}>Subscribe</button>
      }

      let menu
      if ('manage' === relation) {
        menu = <ManagerMenu id={this.props.id}/>
      }
      else if ('user' === this.props.type) {
        menu = <Communicate id={this.props.id}/>
      }
      else {
        menu = <Subscribers {...this.props}/>
      }
      const avatarId = this.state.avatar || this.props.avatar
      const avatar = <ImageDropzone
        imageProperty="avatar"
        imageId={avatarId}
        relation={this.props.relation}
        onDrop={this.onDrop}>
        <Avatar
          avatar={avatarId}
          type={this.props.type}
          big={true}
          className="img-thumbnail"
        />
      </ImageDropzone>
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
      return <div className={'blog' + (this.props.busy ? ' busy' : '')}>
        {header}
        <main>
          {page}
        </main>
      </div>
    }
  }
}
