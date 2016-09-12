import React, {Component} from 'react'
import {Subscriber} from './common/widget'
import {Route} from 'react-router'

export class Phone extends Subscriber {
  onCall = () => {
    const video = document.querySelector('video')
  }

  render() {
    return (
      <div>
        <video/>
        <button type="button" onClick={this.onCall}>Call</button>
      </div>
    )
  }
}

export const PhoneRoute = <Route path='phone' component={Phone}/>
