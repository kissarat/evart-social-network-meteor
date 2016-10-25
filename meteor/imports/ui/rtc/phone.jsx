import React, {Component} from 'react'
import {Subscriber, Busy} from '../common/widget'
import {NotFound} from '/imports/ui/pages'
import {Peer} from './peer'

export class Phone extends Subscriber {
  componentWillReceiveParams(props) {
    this.setState({busy: true})
    const id = +props.params.id
    Meteor.call('blog.get', {id}, (err, blog) => {
      if (blog) {
        blog.busy = false
        blog.peer = Peer.get(id)
        blog.peer.addEventListener('dial', this.onPeerDial)
        blog.peer.addEventListener('addstream', this.onPeerStream)
        this.setState(blog)
      }
      else {
        this.setState({busy: false})
      }
    })
  }

  componentWillMount() {
    this.componentWillReceiveParams(this.props)
  }

  onPeerDial = () => {
    this.setState({dial: true})
  }

  onPeerStream = () => {
    console.log('onPeerStream')
  }

  onCall = () => {
    this.state.peer.offerCall()
  }

  onAnswer = () => {
    this.state.peer.answerCall().then(() => this.setState({dial: true}))
  }

  render() {
    if (this.state.busy) {
      return <Busy/>
    }
    else if (this.state.peer) {
      return <div>
        <h1>{this.state.name || 'Untitled'}</h1>
        <video ref="video"/>
        <button type="button" onClick={this.onCall}>Call</button>
        <button type="button" onClick={this.onAnswer} disabled={!this.state.dial}>Answer</button>
      </div>
    }
    else {
      return <NotFound />
    }
  }
}
