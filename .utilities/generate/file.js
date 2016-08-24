const _ = require('./common')
const mimes = require('./json/mime')

const files = []
const converts = []
for (let i = 0; i < 5000; i++) {
  const mime = _.sample(mimes)
  const id = _.random(_.minTime, _.maxTime)
  files.push({
    id,
    mime: mime.id
  })

  if ('video' === mime.type || 'audio' === mime.type) {
    converts.push({
      file: id,
      size: _.random(4096, 128 * 1024 * 1024)
    })
  }
}

files.sort((a, b) => a.mime.localeCompare(b.mime))

_.saveSQL('file', [
  {
    table: 'file',
    objects: files
  },
  {
    table: 'processTask',
    objects: converts
  }
])
