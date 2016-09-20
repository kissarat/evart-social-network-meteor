import React, {Component} from 'react'
import {Link} from 'react-router'
import {Subscriber, Busy} from '/imports/ui/common/widget'
import {BlogLayout} from './layout'
import {Editor} from './editor'
import {idToTimeString} from '/imports/ui/common/helpers'
import {Avatar} from '/imports/ui/common/widget'

class Attitude extends Component {
  onChange = (e) => {
    const attitude = 'checkbox' === e.target.getAttribute('type')
      ? e.target.checked && 'like'
      : e.nativeEvent.target.value || false
    Meteor.call('estimate', {id: this.props.id, attitude: attitude}, (err, res) => {
      if (err) {
        console.error(err)
      }
      else {
        // console.log(res)
      }
    })
  }

  render() {
    return Meteor.userId() == this.props.from
      ?
      <label className="switch">
        <input type="checkbox" value="like" checked={'like' === this.props.attitude} onChange={this.onChange}/>
        <div className="slider"/>
      </label>
      :
      <div className="switch-dislike">
        <input type="radio" value="hate" className="disliked"
               checked={'hate' === this.props.attitude} onChange={this.onChange}/>
        <input type="radio" className="none"
               checked={!this.props.attitude} onChange={this.onChange}/>
        <input type="radio" value="like" className="liked"
               checked={'like' === this.props.attitude} onChange={this.onChange}/>
        <div className="slider-dislike"></div>
      </div>
  }
}

class Repost extends Component {
  onClick = () => {
    Meteor.call('repost', {id: +this.props.id})
  }

  render() {
    const count = this.props.repost > 0 ? +this.props.repost : ''
    return <div className="repost" onClick={this.onClick}>
      <span className="icon icon-repost"/>
      {count}
    </div>
  }
}

export class Article extends Component {
  componentWillMount() {
    this.state = {}
  }

  onClickComment = (e) => {
    this.setState({comments: true})
  }

  render() {
    const comments = this.state.comments ? <Children id={this.props.id}/> : ''
    const commentButton = 'wall' === this.props.type ?
      <div className="comment">
        <span className="icon icon-quote"/>
        <span className="comment-text" onClick={this.onClickComment}>Comment</span>
      </div>
      : ''
    return <article>
      <div className="posted-by">
        <div className="poster-border">
          <div className="poster-wrapper">
            <Avatar {...this.props} className="img-circle img-responsive"/>
            <time>{idToTimeString(this.props.id)}</time>
          </div>
        </div>
      </div>
      <div className="post-content">
        <div className="content-head">
          <Link className='name' to={'/blog/' + this.props.from}>{this.props.name || 'Untitled'}</Link>
        </div>
        <p>{this.props.text}</p>
        <div className="content-footer">
          {commentButton}
          <Repost {...this.props}/>
          <Attitude {...this.props}/>
        </div>
        {comments}
      </div>
    </article>
  }
}

export class NewsItem extends Component {
  onClickComment = () => {
    this.setState({comments: true})
  }

  render() {
    const comments = this.state && this.state.comments ? <Children id={this.props.id}/> : ''
    return <div className="content-item">
      <div className="content-type">
        <div className="type type-news">
          <span>News</span>
        </div>
      </div>
      <article>
        <img src="/images/profile-image.jpg" alt="..." className="img-circle img-responsive"/>
        <h3>{this.props.name || 'Untitled'} <span>{idToTimeString(this.props.id)}</span></h3>
        <p>{this.props.text}</p>
        <div className="article-footer">
          <div className="comment">
            <span className="icon icon-quote"/>
            <span className="comment-text" onClick={this.onClickComment}>Comment</span>
          </div>
          <Repost {...this.props}/>
        </div>
        {comments}
      </article>
    </div>
  }
}

export class Profile extends Subscriber {
  componentWillReceiveProps(props) {
    this.setState({busy: true})
    if (props.id) {
      this.setupState(props)
    }
    else {
      const id = props.params && props.params.id ? +props.params.id : Meteor.userId()
      Meteor.call('blog.get', {id: id}, (err, state) => {
        if (err) {
          console.error(err)
        }
        else {
          this.setupState(state)
        }
      })
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }
}

export class Blog extends Profile {
  setupState(state) {
    this.setState(state)
    this.subscribe('message', {parent: state.id, type: 'wall'})
  }

  render() {
    if (this.state.busy) {
      return <Busy/>
    }
    else {
      const articles = this.getSubscription('message')
        .map(message => <Article key={message.id} {...message}/>)
      return <BlogLayout {...this.state}>
        <Editor type='wall' id={this.state.id}/>
        <div className="posts">{articles}</div>
      </BlogLayout>
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

export class News extends Subscriber {
  componentWillMount() {
    this.state = {busy: true}
    this.subscribe('message', {type: 'news', limit: 50})
  }

  render() {
    if (this.state.busy) {
      return <Busy/>
    }
    else {
      const items = this.getSubscription('message')
        .map(message => <NewsItem key={message.id} {...message}/>)
      return <div className="container">
        <div className="row wrap">
          <div id="news">{items}</div>
        </div>
      </div>
    }
  }
}
