const TwitchBot = require('.')

const Bot = new TwitchBot({
  channels: ['itmejp', 'gamesdonequick'],
  oauth: 'oauth:30yxno4670anheszf1chpk7upnb8xi',
  username: 'prfnt'
})

Bot.on('join',()=>{
  Bot.on('subscribe', (subscriber)=>{
    console.log(subscriber)
  })
})
