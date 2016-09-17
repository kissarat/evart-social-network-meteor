import React, {Component} from 'react'
import {Link} from 'react-router'
import {BlogLayout} from './blog/layout'
import {Profile, Children} from './blog/article'
import {bucketImage} from '/imports/ui/common/helpers'
import {Busy} from '/imports/ui/common/widget'

export class Gallery extends Profile {
  setupState(state) {
    this.setState(state)
    this.subscribe('file', {from: state.id, type: 'image'})
  }

  render() {
    if (this.state) {
      const images = this.getSubscription('file').map(file =>
        <div key={file.id} className="item">
          <Link to={'/image/' + file.id} className="image"
                style={{backgroundImage: `url("${file.thumb}")`}}/>
        </div>)
      return <BlogLayout {...this.state}>
        <div className="photo-container">
          <div className="albums">
          </div>
          <div className="photos">
            {images}
          </div>
        </div>
      </BlogLayout>
    }
    else {
      return <Busy/>
    }
  }
}

export class Visual extends Component {
  setup(props) {
    Meteor.call('file.get', {id: +props.params.id}, (err, state) => {
      if (err) {
        console.error(err)
      }
      else {
        this.setState(state)
      }
    })
  }

  componentWillMount() {
    this.setup(this.props)
    document.body.setAttribute('class', 'fade in modal-open')
  }

  componentWillUnmount() {
    document.body.removeAttribute('class')
  }

  componentWillReceiveProps(props) {
    this.setup(props)
  }

  render() {
    if (this.state) {
      const content = 'video' === this.state.type
        ? <div></div>
        : <img src={bucketImage(this.state.id)} className="content"/>
      return <div id={'modal-' + this.state.type} className="modal fade modal-media vertical-mid in" tabIndex="-1"
                  role="dialog"
                  style={{display: 'block'}}>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            {content}
            <div className="content-footer">
              <div className="counter"></div>
              <div className="comment">
                <span className="icon icon-quote"/>
                <span className="comment-text">Comment</span>
              </div>
              <div className="repost">
                <span className="icon icon-repost"/>
                {this.state.repost}
              </div>
            </div>
            <Children {...this.state}/>
          </div>
        </div>
      </div>
    }
    else {
      return <div></div>
    }
  }
}
