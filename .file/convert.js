const db = require('./../server/db')
const config = require('./../config')
const ffmpeg = require('fluent-ffmpeg')
const _ = require('underscore')

let count = 0

function error(err) {
  console.error(err)
  process.exit(1)
}

function convert(file) {
  function reportProgress(status) {
    db
      .knex('convert')
      .where({file: fileId})
      .update({
        progress: status.percent,
        processed: status.targetSize
      })
      .promise()
  }

  return new Promise(function (resolve, reject) {
    const fileId = +file.id
    const inputFilename = config.file.temp + '/' + fileId.toString(36)
    const outputFilename = inputFilename + '-converted.m4a'
    ffmpeg()
      .addInput(inputFilename)
      .noVideo()
      .audioChannels(config.convert.audio.channels)
      .audioCodec(config.convert.audio.codec)
      .audioFilters(config.convert.audio.filters)
      .audioFrequency(config.convert.audio.sample_rate)
      .audioQuality(config.convert.audio.quality)
      .on('error', reject)
      .on('start', function (status) {
        console.log(status)
      })
      .on('codecData', function (data) {
        console.log(data)
      })
      .addOutput(outputFilename)
      // .on('progress', reportProgress)
      .on('end', resolve)
      .run()
  })
}

function processTask() {
  db.retrySQL(`
  START TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  UPDATE convert c SET pid = ${process.pid} WHERE
  file IN (SELECT id FROM convert_file ORDER BY priority LIMIT 1)
  RETURNING id, file;
  COMMIT`, null, [db.errors.SERIALIZATION_FAILURE, db.errors.IN_FAILED_SQL_TRANSACTION])
    .then(function (result) {
      if (result.rows.length > 0) {
        const fileId = result.rows[0].file
        db.retrySQL('SELECT * FROM file WHERE id = $1::BIGINT', [fileId], [db.errors.IN_FAILED_SQL_TRANSACTION])
          .then(function (result) {
            return convert(result.rows[0])
          })
          .then(function () {
            return db.retrySQL('DELETE FROM convert WHERE id = $1::BIGINT',
              [fileId], [db.errors.IN_FAILED_SQL_TRANSACTION])
          })
          .then(processTask)
          .catch(error)
      }
      else {
        count--
      }
    })
    .catch(error)
}

function listen() {
  db
    .liveSQL('SELECT * FROM convert WHERE pid is null')
    .on('update', function (diff, data) {
      if (diff.added && diff.added.length > 0) {
        const delta = config.convert.threads - count
        for (let i = 0; i < delta; i++) {
          count++
          setTimeout(processTask, i * config.convert.delay)
        }
      }
    })
}

process.title = 'evart-processTask'
listen()
