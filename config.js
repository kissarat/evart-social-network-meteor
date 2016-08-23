const merge = require('deepmerge')
const local = require('./local')

module.exports = merge({
  mongo: 'mongodb://127.0.0.1:27017/evart',
  file: {
    port: 9080,
    temp: '/tmp/evart'
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
  },
  postgresql: {
    retry: 100
  }
}, local)
