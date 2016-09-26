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

export function bucketFile(id) {
  return `https://${Meteor.settings.public.aws.endpoint}/${Meteor.settings.public.aws.params.Bucket}/${id}`
}

export function thumb(id) {
  return `/thumb/${id}.jpg`
}

export function requestUpload(file) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', _.sample(Meteor.settings.public.upload.servers) + '/' + file.name)
  xhr.setRequestHeader('authorization', 'Token ' + localStorage.getItem('Meteor.loginToken'))
  xhr.setRequestHeader('content-type', file.type)
  if (file.lastModifiedDate instanceof Date) {
    xhr.setRequestHeader('last-modified', file.lastModifiedDate.toGMTString())
  }
  setTimeout(() => xhr.send(file), 0)
  return xhr
}

export function upload(file) {
  return new Promise(function (resolve, reject) {
    const xhr = requestUpload(file)
    xhr.addEventListener('error', reject)
    xhr.addEventListener('load', function () {
      resolve(JSON.parse(xhr.responseText))
    })
  })
}
