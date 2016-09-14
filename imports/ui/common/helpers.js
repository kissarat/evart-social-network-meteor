const config = require('../../../config')

const year = new Date(new Date().getFullYear(), 0).getTime()

export function idToTimeString(id) {
  id = id / (1000 * 1000)
  const delta = Date.now() - id
  if (delta < 48 * 3600 * 1000) {
    return moment(id).fromNow()
  }
  else if (delta < 30 * 3600 * 1000) {
    return moment(id).format('D/M HH:mm')
  }
  else {
    return moment(id).format('M/D/YY')
  }
}

export function bucketImage(id) {
  return `https://${config.aws.endpoint}/${config.aws.params.Bucket}/${(+id).toString(36)}`
}

export function upload(file) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `//${location.hostname}:9080/${file.name}`)
    xhr.setRequestHeader('authorization', 'Token ' + localStorage.getItem('Meteor.loginToken'))
    xhr.setRequestHeader('content-type', file.type)
    if (file.lastModifiedDate instanceof Date) {
      xhr.setRequestHeader('last-modified', file.lastModifiedDate.toGMTString())
    }
    xhr.addEventListener('error', reject)
    xhr.addEventListener('load', function () {
      resolve(JSON.parse(xhr.responseText))
    })
    xhr.send(file)
  })
}
