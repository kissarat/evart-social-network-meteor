const db = require('./../server/db')
const config = require('./../config')
const _ = require('underscore')

let count = 0

function error(err) {
  console.error(err)
  process.exit(1)
}

function convert() {
  db.retrySQL(`
  START TRANSACTION ISOLATION LEVEL REPEATABLE READ;
  UPDATE convert c SET pid = ${process.pid} WHERE
  file IN (SELECT id FROM convert_file ORDER BY priority LIMIT 1)
  RETURNING id, file;
  COMMIT`, null, [db.errors.SERIALIZATION_FAILURE, db.errors.IN_FAILED_SQL_TRANSACTION])
    .then(function (result) {
      if (result.rows.length > 0) {
        console.log(result.rows[0])
        return db.retrySQL('SELECT * FROM file WHERE id = $1::BIGINT', [result.rows[0].file], [db.errors.IN_FAILED_SQL_TRANSACTION])
      }
      else {
        count--
      }
    })
    .then(function (file) {
      if (file) {
        return db.retrySQL('DELETE FROM convert WHERE id = $1::BIGINT',
          [file.id], [db.errors.IN_FAILED_SQL_TRANSACTION])
      }
    })
    .then(function () {
      convert()
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
          setTimeout(convert, i * config.convert.delay)
        }
      }
    })
}

process.title = 'evart-convert'
listen()
