const config = require('./config')
const fs = require('fs')
const fse = require('fs-extra')
const gulp = require('gulp')
const os = require('os')
const spawn = require('child_process').spawn
const tgz = require('tar.gz')
const _ = require('underscore')
const path = require('path')

const settingsFileName = __dirname + '/meteor/settings.json'
const nodeFileName = '/usr/local/bin/node'
const npmFileName = '/usr/local/bin/npm'
const meteorFileName = '/usr/local/bin/meteor'
const gitFileName = 'darwin' === process.platform ? '/usr/local/bin/git' : '/usr/bin/git'

const servers = []

const cpus = os.cpus()

function sequential(done, runs) {
  const run = runs.shift()
  if (run) {
    run(runs.length - 1, function () {
      sequential(done, runs)
    })
  }
  else {
    done()
  }
}

function delay(milliseconds, done, run) {
  sequential(done, _.range(cpus.length).map(() => (i, done) => setTimeout(run, milliseconds, i, done))
}

gulp.task('settings', function (done) {
  fse.writeJson(settingsFileName, config, done)
})

gulp.task('file-server', function (done) {
  delay(8000, done, function (i, done2) {
    const port = (9081 + i)
    const server = spawn(nodeFileName, [__dirname + '/file/server.js', '--port=' + port], {
      cwd: __dirname,
      stdio: 'inherit'
    })
    server.title = 'file-' + port
    servers.push(server)
    done2()
  })
})

gulp.task('convert-server', function (done) {
  delay(8000, done, function (i, done2) {
    const number = (i + 1)
    const server = spawn(nodeFileName, [__dirname + '/file/convert.js', '--number=' + number], {
      cwd: __dirname,
      stdio: 'inherit'
    })
    server.title = 'convert-' + number
    servers.push(server)
    done2()
  })
})

gulp.task('meteor-server', ['settings'], function (done) {
  const server = spawn(meteorFileName, ['--settings=' + settingsFileName, '--port=' + 3001], {
    cwd: __dirname + '/meteor',
    stdio: 'inherit'
  })
  server.title = 'meteor'
  servers.push(server)
  done()
})

gulp.task('dev', ['meteor-server', 'file-server', 'convert-server'])

gulp.task('pull', function (done) {
  spawn(gitFileName, ['pull', 'origin', 'master'], {
    cwd: __dirname,
    stdio: 'inherit'
  })
    .on('close', done)
})

gulp.task('extract', function (done) {
  const archive = path.resolve(__dirname + '/../meteor.tar.gz')
  fs.access(archive, function (err) {
    if (err) {
      if ('ENOENT' == err.code) {
        console.warn(archive + ' not found')
        done()
      }
      else {
        done(err)
      }
    }
    else {
      fse.removeSync(__dirname + '/../bundle')
      tgz().extract(__dirname + '/../meteor.tar.gz', __dirname + '/..', done)
    }
  })
})

gulp.task('prod-dependencies', ['extract'], function (done) {
  spawn(npmFileName, ['install', '--production'], {
    cwd: __dirname + '/../bundle/programs/server',
    stdio: 'inherit'
  })
    .on('close', done)
})

gulp.task('prod', ['pull', 'prod-dependencies', 'file-server', 'convert-server'], function (done) {
  delay(8000, done, function (i, done2) {
    const port = (3001 + i)
    const server = spawn(nodeFileName, [__dirname + '/../bundle/main.js'], {
      cwd: __dirname + '/../bundle',
      stdio: 'inherit',
      env: {
        ROOT_URL: 'http://evart.com',
        PORT: port,
        METEOR_SETTINGS: JSON.stringify(config),
        MONGO_URL: 'mongodb://127.0.0.1:27017/evart'
      }
    })
    server.title = 'meteor-' + port
    servers.push(server)
    server.on('message', function () {
      done2()
    })
  })
})

function exit() {
  servers.forEach(function (server) {
    if (server && server.pid) {
      try {
        process.kill(server.pid, 'SIGINT')
        console.log(`SIGINT ${server.pid} ${server.title}`)
      }
      catch (ex) {
        if ('ESRCH' === ex.code) {
          console.error(`Process ${server.pid} ${server.title} not found`)
        }
        else {
          console.error(ex)
        }
      }
    }
    else {
      console.error(`No ${server.pid} ${server.title}`)
    }
  })
}

process.on('SIGINT', exit)
process.title = 'labiak-gulp'
