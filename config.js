const merge = require('deepmerge')
const local = require('./local')

module.exports = merge({
  file : {
    port: 9080
  },
  image: {
    resize: {
      width: 1920,
      height: 1536,
      size: 655360,
      quality: 70
    },
    thumb: {
      width: 120,
      height: 120,
      quality: 86
    }
  },
  convert: {
    threads: 3,
    delay: 0,
    audio: {
      quality: 0,
      codec: 'libfdk_aac',
      sample_rate: 22050,
      channels: 1
    },
    filters: [
      {
        filter: 'silencedetect',
        options: {n: '-50dB', d: 5}
      }
    ]
  },
  postgresql: {
    retry: 100
  }
}, local)
