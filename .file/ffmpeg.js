const ffmpeg = require('fluent-ffmpeg')
const _ = require('underscore')
const config = require('../server/config')

const filename = process.argv[process.argv.length - 1]
ffmpeg(filename)
  .noVideo()
  .audioChannels(config.convert.channels)
  .audioFrequency(config.convert.sample_rate)
  .audioCodec(config.convert.codec)
  .audioQuality(config.convert.quality)
  .audioFilters(config.convert.filters)
  .output('/tmp/1.m4a')
  .on('progress', function (process) {
    console.log(JSON.stringify(process))
  })
  .on('end', function () {
    console.log('END')
  })
  .run()
