import React, {Component} from 'react'
import {Subscriber} from '/imports/ui/common/widget'
import {UserLayout} from './user'

export class Article extends Component {
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
    return <article>
      <div className="posted-by">
        <div className="poster-border">
          <div className="poster-wrapper">
            <img src="img/profile-image.jpg" alt="..." className="img-circle img-responsive"/>
            <time>20 apr 21:59</time>
          </div>
        </div>
      </div>
      <div className="post-content">
        <div className="content-head">
          <h3>Nikita Safronov</h3>
          <span>&bull;&bull;&bull;</span>
        </div>
        <p>{this.props.text}</p>
        <div className="content-footer">
          <div className="comment">
            <span className="icon icon-quote"/>
            <span className="comment-text">Comment</span>
          </div>
          <div className="repost">
            <span className="icon icon-repost"/>
            3
          </div>
          {attitude}
        </div>
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
      return <UserLayout {...this.state}>{articles}</UserLayout>
    }
    else {
      return <div>Loading...</div>
    }
  }
}
