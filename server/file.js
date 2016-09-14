import {query, knex} from './db'
import request from 'request'
import {escape} from 'querystring'

Meteor.publish('file', function (params = {}) {
  return query('file_message', params)
    .cursor()
})

Meteor.publish('convert', function (params = {}) {
  return knex('convert')
    .cursor()
})

const videoServies = [
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
  for (let i = 0; i < videoServies.length; i++) {
    const object = videoServies[i](url)
    if (object) {
      return object
    }
  }
  return false
}

Meteor.methods({
  'file.get': function (params) {
    return knex('file_message')
      .where(_.pick(params, 'id', 'url'))
      .single()
  },

  'oembed.get': function (params) {
    const service = findService(params.url)
    if (service) {
      return new Promise(function (resolve, reject) {
        console.log(service.oembed)
        request(service.oembed, function (err, r, b) {
          if (err) {
            reject(err)
          }
          else {
            resolve(JSON.parse(b))
          }
        })
      })
    }
    else {
      throw new Meteor.Error(422, 'Unsupported service')
    }
  }
})
