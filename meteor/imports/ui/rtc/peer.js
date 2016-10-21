import _ from 'underscore'
import {isFirefox} from '/imports/constants'
import {channel, register, listenOncePromise} from '../events'

function trigger(target, name, detail) {
  target.dispatchEvent(new CustomEvent(name, {detail: detail}))
}

const events = {
  offer: function (offer) {
    if (Meteor.isDevelopment) {
      console.log('offer', offer.length)
    }
    this.receiveCall(offer)
  },

  answer: function (answer) {
    if (Meteor.isDevelopment) {
      console.log('answer', answer.length)
    }
  },

  candidate: function (candidate) {
    this.addCandidate(candidate)
  }
}

// Polyfills
if (window.webkitRTCPeerConnection) {
  ['createOffer', 'createAnswer'].forEach(function (method) {
    const original = this[method]
    this[method] = function (options) {
      return new Promise((resolve, reject) => original.call(this, resolve, reject, options))
    }
  }, webkitRTCPeerConnection.prototype)
}

const Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || {disabled: true}
Peer.enabled = !Peer.disabled

if (navigator.mediaDevices && navigator.webkitGetUserMedia && !navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia = function (options) {
    return new Promise(function (resolve, reject) {
      navigator.webkitGetUserMedia(options, resolve, reject)
    })
  }
}

export function peerStartup() {
  _.each(events, function (event, key) {
    channel.on(key, function (message) {
      events[key].call(Peer.get(message.from), message.text)
    })
  })
}

let camera

function getUserMedia(options) {
  if (camera) {
    return Promise.resolve(camera)
  }
  else {
    return navigator.mediaDevices.getUserMedia(options)
      .then(function (_camera) {
        camera = _camera
        return camera
      })
  }
}

Peer.peers = {}

if (Meteor.isDevelopment) {
  window.Peer = Peer
}

function trace() {
  console.log.apply(this, arguments)
}

function error() {
  console.error.apply(this, arguments)
}

function makeMediaConstraints(audio = true, video = true) {
  audio = !!audio
  video = !!video
  if (isFirefox) {
    return {
      offerToReceiveAudio: audio,
      offerToReceiveVideo: video
    }
  }
  else {
    return {
      mandatory: {
        OfferToReceiveAudio: audio,
        OfferToReceiveVideo: video
      }
    }
  }
}

_.extend(Peer.prototype, {
  initialize() {
    register(this, {
      identityresult: trace,
      idpassertionerror: error,
      idpvalidationerror: error,
      negotiationneeded: this.onNegotiationNeeded,
      peeridentity: trace,
      iceconnectionstatechange: function (e) {
        trace('CONNECTION: ' + e.target.iceConnectionState)
      },
      signalingstatechange: this.onSignalingStateChange,
      icecandidate: this.onIceCandidate
    })
  },

  onSignalingStateChange(e) {
    trace('SIGNAL: ' + e.target.signalingState)
  },

  onIceCandidate(e) {
    if (e.candidate) {
      this.emit('candidate', JSON.stringify(e.candidate))
    }
    else {
      // error('No candidate')
    }
  },

  emit(type, text) {
    channel.dispatch({
      to: this.getReceiverId(),
      type: type,
      text: text
    })
  },

  isClosed() {
    return ['closed', 'disconnected', 'failed'].indexOf(this.iceConnectionState) >= 0
  },

  isApproved() {
    return !this.callOffer && 'have-remote-offer' === this.signalingState
  },

  addCandidate(candidate) {
    candidate = new RTCIceCandidate({candidate})
    if (this.isApproved()) {
      this.addIceCandidate(candidate)
    }
    else {
      if (!this.candidates) {
        this.candidates = []
      }
      this.candidates.push(candidate)
    }
  },

  setupCamera() {
    return getUserMedia({audio: true, video: true})
      .then(_camera => {
        // _camera.getTracks().forEach(track => this.addTrack(track, _camera))
        this.addStream(_camera)
      })
  },

  trace() {
    return {
      connection: this.iceConnectionState,
      signal: this.signalingState,
      streams: this.getRemoteStreams()
    }
  },

  getReceiverId() {
    return +this.peerIdentity
  },

  addWaitingCandidates() {
    if (this.candidates) {
      this.candidates.forEach(candidate => this.addIceCandidate(candidate))
      this.candidates = null
    }
    else {
      console.error('No waiting candidates')
    }
  },

  offer(options) {
    if (!options) {
      options = makeMediaConstraints()
    }
    return this.createOffer(options)
      .then(offer => {
        this.setLocalDescription(offer)
        return offer
      })
  },

  offerCall() {
    return this.setupCamera()
      .then(() => listenOncePromise(this, 'negotiationneeded'))
      .then(() => this.offer(makeMediaConstraints()))
      .then(offer => this.emit('offer', offer.sdp))
      .catch(error)
  },

  onNegotiationNeeded(e) {
    // trace('negotiationneeded', e)
  },

  answer(description, options) {
    if ('string' === typeof description) {
      description = new RTCSessionDescription({
        type: 'offer',
        sdp: description
      })
    }
    return this.setRemoteDescription(description)
      .then(() => {
        this.addWaitingCandidates()
        return this.createAnswer(options)
      })
      .then(answer => {
        this.setLocalDescription(answer)
        return answer
      })
  },

  answerCall() {
    return this.setupCamera()
      .then(() => listenOncePromise(this, 'negotiationneeded'))
      .then(() => this.answer(this.callOffer, makeMediaConstraints()))
      .then(answer => this.emit('answer', answer.sdp))
  },

  receiveCall(offer) {
    if ('string' === typeof offer) {
      offer = new RTCSessionDescription({
        type: 'offer',
        sdp: offer
      })
    }
    this.callOffer = offer
    this.candidates = []
    trigger(this, 'call', offer)
  }
})

Peer.get = function (id) {
  const peer = Peer.peers[id]
  if (peer) {
    return peer
  }
  else {
    const peer = new Peer({
      iceServers: [],
      peerIdentity: id
    })
    peer.initialize()
    if (!peer.peerIdentity) {
      peer.peerIdentity = id
    }
    return Peer.peers[id] = peer
  }
}

window.Peer = Peer
export default Peer
