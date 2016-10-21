const {extend} = require('underscore')

function lowercase(obj) {
  if (obj instanceof Array) {
    return obj.map(v => v instanceof Object ? lowercase(v) : v)
  }
  else {
    const result = {}
    for (const key in obj) {
      let value = obj[key]
      result[key.toLocaleLowerCase()] = value instanceof Object ? lowercase(value) : value
    }
    return result
  }
}


module.exports = {
  lowercase,

  send(object) {
    if ('function' === typeof process.send) {
      process.send(extend(object, {
        name: process.title,
        time: process.hrtime()
      }))
      return true
    }
    else {
      console.warn('Process has no parent')
      return false
    }
  }
}
