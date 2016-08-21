import { Meteor } from 'meteor/meteor'

// Meteor.startup(() => {
// })

WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*')
  return next()
})
