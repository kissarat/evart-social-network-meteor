const config = require('./config')
const fs = require('fs')
const fse = require('fs-extra')
const gulp = require('gulp')
const os = require('os')
const spawn = require('child_process').spawn
const tgz = require('tar.gz')
const _ = require('underscore')

const settingsFileName = __dirname + '/meteor/settings.json'
const nodeFileName = '/usr/local/bin/node'

const threads = []
for (let i = 0; i < os.cpus().length; i++) {
  threads.push({
    file: [],
    convert: [],
    meteor: [],
    node: []
  })
}

function delay(milliseconds, cb) {
  threads.forEach(function (thread, i) {
    setTimeout(cb, milliseconds * i, thread, i)
  })
}

gulp.task('settings', function (cb) {
  fse.writeJson(settingsFileName, config, cb)
})

gulp.task('file-server', function () {
  delay(8000, function (thread, i) {
    thread.file.push(spawn(nodeFileName, [__dirname + '/file/server.js', '--port=' + (9081 + i)], {
      cwd: __dirname,
      stdio: 'inherit'
    }))
  })
})

gulp.task('convert-server', function () {
  delay(8000, function (thread, i) {
    thread.convert.push(spawn(nodeFileName, [__dirname + '/file/convert.js', '--number=' + (i + 1)], {
      cwd: __dirname,
      stdio: 'inherit'
    }))
  })
})

gulp.task('meteor-server', ['settings'], function () {
  threads[0].meteor.push(spawn('meteor', ['--settings=' + settingsFileName, '--port=' + 3001], {
    cwd: __dirname + '/meteor',
    stdio: 'inherit'
  }))
})

gulp.task('dev', ['meteor-server', 'file-server', 'convert-server'])

gulp.task('pull', function (cb) {
  spawn('git', ['pull', 'origin', 'master'], {
    cwd: __dirname,
    stdio: 'inherit'
  })
    .on('close', function () {
      cb()
    })
})

gulp.task('extract', function (cb) {
  fs.access(__dirname + '/../meteor.tag.gz', function (err) {
    if (err) {
      if ('ENOENT' == err.code) {
        cb()
      }
      else {
        cb(err)
      }
    }
    else {
      fse.removeSync(__dirname + '/../bundle')
      tgz().extract(__dirname + '/../meteor.tar.gz', __dirname + '/..', cb)
    }
  })
})

gulp.task('prod-dependencies', ['extract'], function (cb) {
  spawn('npm', ['install', '--production'], {
    cwd: __dirname + '/../bundle/programs/server',
    stdio: 'inherit'
  })
    .on('close', function () {
      cb()
    })
})

gulp.task('prod', ['pull', 'prod-dependencies', 'file-server', 'convert-server'], function () {
  delay(8000, function (thread, i) {
    thread.node.push(spawn(nodeFileName, [__dirname + '/../bundle/main.js'], {
      cwd: __dirname + '/../bundle',
      stdio: 'inherit',
      env: {
        ROOT_URL: 'http://evart.com',
        PORT: (3001 + i),
        METEOR_SETTINGS: JSON.stringify(config),
        MONGO_URL: 'mongodb://127.0.0.1:27017/evart'
      }
    }))
  })
})

function exit() {
  _.flatten(_.values(threads)).forEach(function (p) {
    process.kill(p.pid, 'SIGINT')
  })
}

process.on('SIGINT', exit)
process.title = 'labiak-gulp'
