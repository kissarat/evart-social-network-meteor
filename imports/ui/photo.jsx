import React, {Component} from 'react'
import {Link} from 'react-router'
import {BlogLayout} from './blog/layout'
import {Profile} from './blog/article'

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
                style={{'background-image': `url("${file.thumb}")`}}/>
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
      return <div>Loading...</div>
    }
  }
}
