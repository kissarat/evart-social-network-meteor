import {query, table, timeId, errors} from './db'
import request from 'request'
import {escape} from 'querystring'

Meteor.publish('file', function (params = {}) {
  return query('file_message', params)
    .cursor()
})

Meteor.publish('file_view', function (params = {}) {
  return query('file_view', params)
    .cursor()
})

Meteor.publish('convert', function (params = {}) {
  return table('convert')
    .cursor()
})

const videoServices = [
  function youtube(url) {
    const id = /youtube.com.*v=(\w+)/.exec(url)
    if (id) {
      const normalized = `https://youtube.com/watch?v=${id[1]}`
      return {
        url: normalized,
        oembed: `http://youtube.com/oembed?url=${escape(normalized)}&format=json`
      }
    }
    return false
  },
  function vimeo(url) {
    const id = /vimeo.com\/(\d+)/.exec(url)
    if (id) {
      const normalized = `https://vimeo.com/${id[1]}`
      return {
        url: normalized,
        oembed: 'https://vimeo.com/api/oembed.json?url=' + escape(normalized)
      }
    }
    return false
  },
  function flickr(url) {
    const id = /flickr.com\/photos\/([^/]+\/\d+)\//.exec(url)
    if (id) {
      const normalized = `https://flickr.com/photos/${id[1]}`
      return {
        url: normalized,
        oembed: `https://www.flickr.com/services/oembed/?url=${escape(normalized)}&format=json`
      }
    }
    return false
  },
  function rutube(url) {
    const id = /rutube.ru\/video\/([0-9a-f]+)/.exec(url)
    if (id) {
      const normalized = `https://rutube.ru/video/${id[1]}/ `
      return {
        url: normalized,
        oembed: `https://rutube.ru/api/oembed/?url=${escape(normalized)}&format=json`
      }
    }
    return false
  }
]

function findService(url) {
  for (let i = 0; i < videoServices.length; i++) {
    const object = videoServices[i](url)
    if (object) {
      return object
    }
  }
  return false
}

function requestOembed({url}) {
  const service = findService(url)
  if (service) {
    return new Promise(function (resolve, reject) {
      request(service.oembed, function (err, r, b) {
        if (err) {
          reject(err)
        }
        else {
          try {
            resolve(JSON.parse(b))
          }
          catch (ex) {
            reject(ex)
          }
        }
      })
    })
  }
  else {
    throw new Meteor.Error(422, 'Unsupported service')
  }
}

Meteor.methods({
  'file.get': function (params) {
    return table('file_message')
      .where(_.pick(params, 'id', 'url'))
      .single()
  },

  'oembed.get': requestOembed,

  'external.add'(params) {
    return requestOembed(params)
      .then(function (oembed) {
        return table('file')
          .returning(['id', 'name'])
          .insert({
            id: timeId(),
            name: oembed.title,
            thumb: oembed.thumbnail_url,
            data: oembed,
            url: params.url
          })
          .single()
      })
      .then(function (file) {
        return table('message')
          .returning('id')
          .insert({
            id: file.id,
            type: 'file',
            from: +Meteor.userId(),
            text: file.name
          })
          .single()
      })
  }
})
