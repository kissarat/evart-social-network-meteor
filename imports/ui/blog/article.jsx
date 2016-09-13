import React, {Component} from 'react'
import {Link} from 'react-router'
import {Subscriber} from '/imports/ui/common/widget'
import {BlogLayout} from './layout'
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
          <Link className='name' to={'/blog/' + this.props.from}>{this.props.name || 'Untitled'}</Link>
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
  setupState(state) {
    this.setState(state)
    this.subscribe('message', {parent: state.id, type: 'wall'})
  }

  setup(props) {
    if (props.id) {
      this.setupState(props)
    }
    else {
      const id = props.params && props.params.id ? +props.params.id : Meteor.userIdInt()
      Meteor.call('blog.get', {id: id}, (err, state) => {
        if (err) {
          console.error(err)
        }
        else {
          state.busy = false
          this.setupState(state)
        }
      })
    }
  }

  componentWillMount() {
    this.setup(this.props)
  }

  componentWillReceiveProps(props) {
    this.setState({busy: true})
    this.setup(props)
  }

  render() {
    if (this.state) {
      const articles = this.getSubscription('message')
        .map(message => <Article key={message.id} {...message}/>)
      return <BlogLayout {...this.state}>
        <Editor type='wall' id={this.state.id}/>
        <div className="posts">{articles}</div>
      </BlogLayout>
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
