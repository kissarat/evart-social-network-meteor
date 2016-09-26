import React, {Component} from 'react'
import {Link, browserHistory} from 'react-router'
import {BlogLayout} from './blog/layout'
import {Profile, Children} from './blog/article'
import {bucketFile, pageTitle} from '/imports/ui/common/helpers'
import {Busy, ImageDropzone, Subscriber} from '/imports/ui/common/widget'
import {Video} from './video'

export class Gallery extends Profile {
  setupState(state) {
    this.setState(state)
    this.subscribe('file', {from: state.id, type: 'image'})
  }

  onClick(file, e) {
    if (this.props.open instanceof Function) {
      e.preventDefault()
      this.props.open(file)
    }
  }

  render() {
    if (this.state) {
      const upload = 'manage' == this.state.relation
        ? <ImageDropzone className="upload-photo" relation="manage">Upload</ImageDropzone>
        : ''
      const images = this.getSubscription('file').map(file =>
        <div key={file.id} className="item">
          <Link to={'/image/' + file.id}
                className="image"
                style={{backgroundImage: `url("${file.thumb}")`}}
                onClick={(e) => this.onClick(file, e)}
          />
        </div>)
      const content = <div className="photo-container">
        <div className="albums">
        </div>
        <div className="photos">
          {upload}
          {images}
        </div>
      </div>
      return this.props.tiny ? content : <BlogLayout {...this.state}>{content}</BlogLayout>
    }
    else {
      return <Busy/>
    }
  }
}

export class Visual extends Component {
  setup(props) {
    pageTitle(props.name)
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
        ? <Video {...this.state}/>
        : <img src={bucketFile(this.state.id)} className="content"/>
      return <div className={'visual-background visual visual-' + this.state.type}>
        <div className="center">
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
    }
    else {
      return <Busy/>
    }
  }
}
