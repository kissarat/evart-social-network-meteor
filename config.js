const merge = require('deepmerge')
const local = require('./local')

module.exports = merge({
  mongo: 'mongodb://127.0.0.1:27017/evart',
  file: {
    port: 9080
  },
  image: {
    resize: {
      width: 1920,
      height: 1080,
      size: 655360,
      quality: 70
    },
    thumb: {
      width: 96,
      height: 96,
      quality: 86
    }
  }
}, local)
