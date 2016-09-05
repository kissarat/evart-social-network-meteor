import _ from 'underscore'
import {isFirefox} from '../common'
import {channel, register, listenOncePromise} from './events'

function trigger(target, name, detail) {
  target.dispatchEvent(new CustomEvent(name, {detail: detail}))
}

const events = {
  offer: function (offer) {
    this.receiveCall(offer)
  },

  answer: function () {

  },

  candidate: function (candidate) {
    if (this.isApproved()) {
      this.addIceCandidate(candidate)
    }
  }
}

const Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || {}

// Polyfills
if (window.webkitRTCPeerConnection) {
  ['createOffer', 'createAnswer'].forEach(function (method) {
    const original = this[method]
    this[method] = function (options) {
      return new Promise((resolve, reject) => original.call(this, resolve, reject, options))
    }
  }, Peer.prototype)
}

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
      signalingstatechange: this.OnSignalingStateChange,
      icecandidate: this.OnIceCandidate
    })
  },

  OnSignalingStateChange(e) {
    trace('SIGNAL: ' + e.target.signalingState)
  },

  OnIceCandidate: function (e) {
    if (e.candidate) {
      this.emit('candidate', JSON.stringify(e.candidate))
    }
    else {
      // error('No candidate')
    }
  },

  emit: function (type, text) {
    channel.dispatch({
      to: this.getReceiverId(),
      type: type,
      text: text
    })
  },

  isClosed: function () {
    return ['closed', 'disconnected', 'failed'].indexOf(this.iceConnectionState) >= 0
  },

  isApproved: function () {
    return !this.callOffer && 'have-remote-offer' === this.signalingState
  },

  addCandidate: function (candidate) {
    if (this.isApproved()) {
      this.addIceCandidate(candidate)
    }
    else {
      this.candidates.push(candidate)
    }
  },

  setupCamera: function () {
    return getUserMedia({audio: true, video: true})
      .then(_camera => {
        // _camera.getTracks().forEach(track => this.addTrack(track, _camera))
        this.addStream(_camera)
      })
  },

  trace: function () {
    return {
      connection: this.iceConnectionState,
      signal: this.signalingState,
      streams: this.getRemoteStreams()
    }
  },

  getReceiverId: function () {
    return parseInt(this.peerIdentity, 36)
  },

  addWaitingCandidates: function () {
    if (this.candidates) {
      this.candidates.forEach(candidate => this.addIceCandidate(candidate))
      this.candidates = null
    }
    else {
      console.error('No waiting candidates')
    }
  },

  offer: function (options) {
    if (!options) {
      options = makeMediaConstraints()
    }
    return this.createOffer(options)
      .then(offer => {
        this.setLocalDescription(offer)
        return offer
      })
  },

  offerCall: function () {
    return this.setupCamera()
      .then(() => listenOncePromise(this, 'negotiationneeded'))
      .then(() => this.offer(makeMediaConstraints()))
      .then(offer => this.emit('offer', offer.sdp))
      .catch(error)
  },

  onNegotiationNeeded: function (e) {
    // trace('negotiationneeded', e)
  },

  answer: function (description, options) {
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
      .then(answer => this.setLocalDescription(answer))
  },

  answerCall: function () {
    return this.setupCamera()
      .then(() => listenOncePromise(this, 'negotiationneeded'))
      .then(() => this.answer(this.callOffer, makeMediaConstraints()))
      .then(answer => this.emit('answer', answer.sdp))
  },

  receiveCall: function (offer) {
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
  if ('number' === typeof id) {
    id = id.toString(36)
  }
  let peer = Peer.peers[id]
  if (!peer) {
    peer = new Peer({
      iceServers: [],
      peerIdentity: id
    })
    peer.initialize()
    if (!peer.peerIdentity) {
      peer.peerIdentity = id
    }
    Peer.peers[id] = peer
  }
  return peer
}

window.Peer = Peer
export default Peer
