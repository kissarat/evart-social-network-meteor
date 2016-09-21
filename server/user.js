import {timeId, log, table} from './db'
import {generate} from 'randomstring'

const twilio = new Twilio(_.pick(Meteor.settings.sms, 'from', 'sid', 'token'));
function sendSMS(phone, text, cb) {
  twilio.sendSMS({
    to: '+' + phone,
    body: text
  }, cb);
}

function digits(s) {
  return 'string' === typeof s ? s.replace(/[^\d]+/g, '') : false
}

Accounts.onCreateUser(function (options, user) {
  if (!/^[\w\._\-]{4,23}$/.test(user.username)) {
    throw new Meteor.Error(403, 'User validation failed')
  }
  user._id = timeId().toString(10)
  return user
})

Meteor.methods({
  verify({phone, code, sid}) {
    if (code) {
      if (!sid) {
        throw new Meteor.Error(400)
      }
      return table('verify').where({sid: sid, code: digits(code)}).single().then(function (found) {
        const data = {success: !!found}
        return log('user', 'approve', data).then(() => data)
      })
    }
    else {
      phone = digits(phone)
      if (phone && Meteor.settings.sms.codes.some(a => 0 === phone.indexOf(a))) {
        return table('blog').where('phone', phone).single().then(function (found) {
          if (found) {
            throw new Meteor.Error(403, 'Number is registered')
          }
          else {
            const code = generate({charset: 'numeric', length: 6})
            return new Promise(function (resolve, reject) {
              sendSMS(phone, 'Evart Social Network. Code: ' + code, function (err, response) {
                if (err) {
                  reject(err)
                }
                else {
                  var result = {
                    success: !!response.sid,
                    status: response.status
                  };
                  if (result.success) {
                    result.sid = response.sid
                    result.time = response.dateUpdated
                    log('user', 'verify', {
                      sid: response.sid,
                      code: code
                    })
                      .then(() => resolve(result))
                      .catch(reject)
                  }
                  else {
                    reject(result);
                  }
                }
              })
            })
          }
        })
      }
      throw new Meteor.Error(400, 'Invalid phone')
    }
  },

  'user.create'(params) {
    ['domain', 'password', 'surname', 'forename', 'phone', 'code', 'sid']
      .forEach(function (key) {
        if ('string' === typeof params[key]) {
          params[key] = params[key].trim()
        }
        else {
          throw new Meteor.Error(400, 'Bad Request', JSON.stringify({[key]: 'Is required'}))
        }
      })
    const verifyParams = _.pick(params, 'sid', 'code')
    if (_.isEmpty(verifyParams)) {
      throw new Meteor.Error(400, 'No validation parameters found')
    }
    return table('verify')
      .where(verifyParams)
      .single()
      .then(function (found) {
        return new Promise(function (resolve, reject) {
          if (!found) {
            throw new Meteor.Error(403, 'Session is not found')
          }
          const data = _.pick(params, ['domain', 'name', 'surname', 'forename', 'phone', 'email'])
          data.id = timeId()
          Meteor.users.insert({_id: data.id.toString(), username: data.domain})
          Accounts.setPassword(data.id.toString(), params.password)
          data.name = data.surname + ' ' + data.forename
          data.type = 'user'
          table('blog')
            .returning('id', 'domain')
            .insert(data)
            .promise()
            .then(function () {
              data.success = true
              return log('user', 'create', params).then(() => data)
            })
            .then(resolve, reject)
        })
      })
  },

  exists(params) {
    return table('blog').where(params).promise().then(function (result) {
      return {exists: result.rowCount > 0}
    })
  }
})
