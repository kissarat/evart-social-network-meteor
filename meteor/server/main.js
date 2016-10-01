process.title = 'labiak-meteor'

Meteor.startup(() => {
  if (Meteor.isProduction) {
    process.send({
      type: 'start',
      server: {
        type: 'meteor',
        port: process.env.PORT
      },
      name: process.title,
      time: process.hrtime()
    })
    process.title = 'labiak-meteor-' + process.env.PORT
    console.log(`Meteor server on port ${process.env.PORT} started`)
  }
})

WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*')
  return next()
})
