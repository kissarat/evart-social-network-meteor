const merge = require('deepmerge')
const _ = require('underscore')


function sequential(tasks, params) {
  if (tasks.length > 0) {
    const task = tasks[0]
    const promise = task instanceof Function
      ? task(params)
      : task.run(params ? merge(task, params) : task)
    const next = function () {
      return sequential(tasks.slice(1), params)
    }
    return promise ? promise.then(next) : Promise.resolve(next)
  }
  return Promise.resolve()
}

function multiply(n, run) {
  return _.range(n).map(i => (task = {}) => {
    task.name = run.name
    task.number = i
    return run(task)
  })
}

function done(reject, resolve) {
  return function (er, re) {
    if (er) {
      reject(er)
    }
    else {
      resolve(re)
    }
  }
}

class Worker {
  constructor(tasks = {}) {
    this.tasks = tasks
  }

  run(name, params) {
    console.log(this.resolve(name))
    const tasks = this.resolve(name).map(name => {
      let task = this.tasks[name]
      if (task instanceof Function) {
        return {
          name,
          run: task
        }
      }
      task.name = name
      return task
    })
    return sequential(tasks, params)
  }

  task(name, deps, run) {
    if ('function' === typeof deps) {
      run = deps
      deps = null
    }
    this.tasks[name] = {deps, run}
  }

  resolve(name) {
    const task = this.tasks[name]
    let deps = []
    if (task.deps instanceof Array) {
      task.deps.forEach((name) => {
        deps = deps.concat(this.resolve(name))
      })
      deps = deps.concat(task.deps)
    }
    deps.push(name)
    return _.uniq(deps)
  }
}

module.exports = {Worker, sequential, multiply, done}
