const config = require('./config')
const fs = require('fs')
const fse = require('fs-extra')
const os = require('os')
const spawn = require('child_process').spawn
const tgz = require('tar.gz')
const _ = require('underscore')
const path = require('path')
const {Worker, sequential, multiply, done} = require('./conveyor')

const settingsFileName = __dirname + '/meteor/settings.json'
const nodeFileName = '/usr/local/bin/node'
const npmFileName = '/usr/local/bin/npm'
const meteorFileName = '/usr/local/bin/meteor'
const gitFileName = 'darwin' === process.platform ? '/usr/local/bin/git' : '/usr/bin/git'

const servers = []

const cpus = os.cpus()

function promiseStart(child) {
  return new Promise(function (resolve, reject) {
    child.on('error', reject)
    child.on('message', function (e) {
      if ('start' === e.type) {
        resolve()
      }
    })
  })
}

const stdio = ['inherit', 'inherit', 'inherit', 'ipc']

const worker = new Worker({
  settings() {
    return new Promise(function (resolve, reject) {
      fse.writeJson(settingsFileName, config, (er, re) => er ? reject(er) : resolve(re))
    })
  },

  pull() {
    return new Promise(function (resolve, reject) {
      spawn(gitFileName, ['pull', 'origin', 'master'], {
        cwd: __dirname,
        stdio: 'inherit'
      })
        .on('error', reject)
        .on('close', resolve)
    })
  },

  admin() {
    const server = spawn(nodeFileName, [__dirname + '/admin'], {
      cwd: __dirname,
      stdio,
      env: {
        KNEX: JSON.stringify(config.postgresql)
      }
    })
    server.title = 'admin'
    servers.push(server)
    return promiseStart(server)
  },

  file() {
    return sequential(multiply(cpus.length, function ({number}) {
      const port = 9081 + number
      const server = spawn(nodeFileName, [__dirname + '/file/server.js', '--port=' + port], {
        cwd: __dirname,
        stdio
      })
      server.title = 'file-' + port
      servers.push(server)
      return promiseStart(server)
    }))
  },

  convert: () => sequential(multiply(cpus.length, function ({number}) {
    number++
    const server = spawn(nodeFileName, [__dirname + '/file/convert.js', '--number=' + number], {
      cwd: __dirname,
      stdio
    })
    server.title = 'convert-' + number
    servers.push(server)
    return promiseStart(server)
  })),

  extract() {
    const archive = path.resolve(__dirname + '/../meteor.tar.gz')
    return new Promise(function (resolve, reject) {
      fs.access(archive, done(reject, function () {
        fse.removeSync(__dirname + '/../bundle')
        tgz().extract(__dirname + '/../meteor.tar.gz', __dirname + '/..', done(reject, resolve))
      }))
    })
  },

  dependencies() {
    return new Promise(function (resolve) {
      spawn(npmFileName, ['install', '--production'], {
        cwd: __dirname + '/../bundle/programs/server',
        stdio: 'inherit'
      })
        .on('close', resolve)
    })
  },

  dev: {
    deps: ['settings', 'file', 'convert'],
    run() {
      const server = spawn(meteorFileName, ['--settings=' + settingsFileName, '--port=' + 3001], {
        cwd: __dirname + '/meteor',
        stdio
      })
      server.title = 'meteor'
      servers.push(server)
    }
  },

  prod: {
    deps: ['file', 'convert'],
    run: () => sequential(multiply(cpus.length, function ({number}) {
      const port = 3001 + number
      const server = spawn(nodeFileName, [__dirname + '/../bundle/main.js'], {
        cwd: __dirname + '/../bundle',
        stdio,
        env: {
          ROOT_URL: 'http://evart.com',
          PORT: port,
          METEOR_SETTINGS: JSON.stringify(config),
          MONGO_URL: 'mongodb://127.0.0.1:27017/evart'
        }
      })
      server.title = 'meteor-' + port
      servers.push(server)
      return promiseStart(server)
    }))
  }
})

const task = process.argv[process.argv.length - 1]
if (!worker.hasTask(task)) {
  console.error(`Task "${task}" not found`)
  process.exit(1)
}
worker.run(task, {log: true})
  .catch(function (err) {
    console.error(err)
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
process.title = 'labiak'
