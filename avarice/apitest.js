const twitch = require('twitch.tv')

options={
	ua:"i think this does nothing",
	apiVersion:"5",
	clientID:"xuuji0gfwn2swxwp15urun7nennva9"
}

twitch('streams/10817445',options,function(err,res){
	console.log(res)
})


