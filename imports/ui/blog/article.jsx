import React, {Component} from 'react'
import {Subscriber} from '/imports/ui/common/widget'
import {UserLayout} from './user'
import {Editor} from './editor'
import {idToTimeString} from '/imports/ui/common/helpers'

export class Article extends Component {
  componentWillMount() {
    this.state = {}
  }

  onChangeAttitude = (e) => {
    Meteor.call('estimate', {id: this.props.id, attitude: e.nativeEvent.target.value || false}, (err, res) => {
      if (err) {
        console.error(err)
      }
      else {
        // console.log(res)
      }
    })
  }

  onClickComment = (e) => {
    this.setState({comments: true})
  }

  render() {
    const attitude = Meteor.userIdInt() == this.props.from
      ?
      <label className="switch">
        <input type="checkbox" checked={this.props.like}/>
        <div className="slider"></div>
      </label>
      :
      <div className="switch-dislike">
        <input type="radio" value="hate" className="disliked"
               checked={'hate' === this.props.attitude} onChange={this.onChangeAttitude}/>
        <input type="radio" className="none"
               checked={!this.props.attitude} onChange={this.onChangeAttitude}/>
        <input type="radio" value="like" className="liked"
               checked={'like' === this.props.attitude} onChange={this.onChangeAttitude}/>
        <div className="slider-dislike"></div>
      </div>
    const comments = this.state.comments ? <Children id={this.props.id}/> : ''
    const buttons = 'wall' === this.props.type ?
      <div className="comment">
        <span className="icon icon-quote"/>
        <span className="comment-text" onClick={this.onClickComment}>Comment</span>
      </div>
      : ''
    return <article>
      <div className="posted-by">
        <div className="poster-border">
          <div className="poster-wrapper">
            <img src="/images/profile-image.jpg" alt="..." className="img-circle img-responsive"/>
            <time>{idToTimeString(this.props.id)}</time>
          </div>
        </div>
      </div>
      <div className="post-content">
        <div className="content-head">
          <h3>{this.props.name || 'Untitled'}</h3>
        </div>
        <p>{this.props.text}</p>
        <div className="content-footer">
          {buttons}
          {attitude}
        </div>
        {comments}
      </div>
    </article>
  }
}

export class Blog extends Subscriber {
  componentWillMount() {
    this.state = {}
    const id = +this.props.params.id || Meteor.userIdInt()
    Meteor.call('blog.get', {id: id}, (err, res) => {
      if (err) {
        console.error(err)
      }
      else {
        this.setState(res)
        this.subscribe('message', {parent: id, type: 'wall'})
      }
    })
  }

  render() {
    if (this.state.id) {
      const articles = this.getSubscription('message')
        .map(message => <Article key={message.id} {...message}/>)
      return <UserLayout {...this.state}>
        <Editor type='wall' id={this.props.params.id}/>
        <div className="posts">{articles}</div>
      </UserLayout>
    }
    else {
      return <div>Loading...</div>
    }
  }
}

export class Children extends Subscriber {
  componentWillMount() {
    this.subscribe('message', {parent: this.props.id, type: 'child'})
  }

  render() {
    const comments = this.getSubscription('message').map(comment => <Article key={comment.id} {...comment}/>)
    return <div className="comments">
      <Editor type="child" id={this.props.id}/>
      <div className="posts">{comments}</div>
    </div>
  }
}
