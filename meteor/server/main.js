const {send} = require('/imports/server/common')

process.title = 'labiak-meteor'

Meteor.startup(() => {
  if (Meteor.isProduction) {
    send({type: 'start'})
    process.title = 'labiak-meteor-' + process.env.PORT
    console.log(`Meteor server on port ${process.env.PORT} started`)
  }
})

WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*')
  return next()
})
