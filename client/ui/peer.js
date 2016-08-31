import _ from 'underscore'
import {isFirefox} from '../common'
import {channel} from './events'

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

const Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection

if (window.webkitRTCPeerConnection) {
  ['createOffer', 'createAnswer'].forEach(function (method) {
    const original = this[method]
    this[method] = function () {
      return new Promise(function (resolve, reject) {
        original.call(this, resolve, reject, options)
      })
    }
  }, Peer.prototype)
}

_.each(events, function (event, key) {
  channel.on(key, function (message) {
    events[key].call(Peer.get(message.from), message.text)
  })
})

if (navigator.webkitGetUserMedia && !navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia = function (options) {
    return new Promise(function (resolve, reject) {
      navigator.webkitGetUserMedia(options, resolve, reject)
    })
  }
}

let camera

function getUserMedia(options) {
  return new Promise(function (resolve, reject) {
    if (camera) {
      resolve(camera)
    }
    else {
      navigator.mediaDevices.getUserMedia(options).then(function (_camera) {
        camera = _camera
      })
        .catch(reject)
    }
  })
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
      negotiationneeded: trace,
      peeridentity: trace,
      iceconnectionstatechange: function (e) {
        trace('CONNECTION: ' + e.target.iceConnectionState)
      },
      signalingstatechange: this.OnSignalingStateChange,
      icecandidate: this.OnIceCandidate
    })
  },

  OnSignalingStateChange() {
    trace('SIGNAL: ' + e.target.signalingState)
  },

  OnIceCandidate: function (e) {
    if (e.candidate) {
      channel.emit('candidate', e.candidate)
    }
    else {
      error('No candidate')
    }
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
    return getUserMedia({audio: true, video: true}).then(camera => {
      this.addStream(camera)
      return camera
    })
  },

  trace: function () {
    return {
      connection: this.iceConnectionState,
      signal: this.signalingState,
      streams: this.getRemoteStreams()
    }
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
    let offer
    return this.createOffer(options)
      .then((_offer) => {
        offer = _offer
        return this.setLocalDescription(offer)
      })
      .then(() => offer)
  },

  offerCall: function () {
    return this.setupCamera()
      .then(() => this.offer(makeMediaConstraints()))
      .then(offer => channel.dispatch({
        type: 'offer',
        text: offer.sdp
      }))
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

  answerCall: function (audio = true, video = true) {
    return this.setupCamera()
      .then(() => this.answer(this.callOffer, makeMediaConstraints()))
      .then(answer => channel.dispatch({
        type: 'answer',
        text: answer.sdp
      }))
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
    Peer.peers[id] = peer
  }
  return peer
}

window.Peer = Peer
export default Peer
