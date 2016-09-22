const ffprobe = require('node-ffprobe')
const _ = require('underscore')

const filename = process.argv[process.argv.length - 1]
ffprobe(filename, function (err, probe) {
  if (err) {
    console.error(err)
  }
  else {
    console.log(JSON.stringify({
      streams: probe.streams.map(function (stream) {
        return _.pick(stream, 'codec_name', 'codec_type', 'bit_rate', 'sample_rate')
      }),
      metadata: probe.metadata
    }, null, '\t'))
    console.log(probe)
  }
})
