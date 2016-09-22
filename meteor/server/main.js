Meteor.startup(() => {
  process.title = 'evart'
})

WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*')
  return next()
})
