/*---------------------
	:: Player 
	-> controller
---------------------*/
var PlayerController = {

	builder: function(req, res) {

		var skinColorParam = req.param('skin');
		var hairColorParam = req.param('hair');
		var pantsColorParam = req.param('pants');
		var tshirtParamParam = req.param('shirt');

		if (req.method == 'POST') {
			Player.update({
				name: global.player.name
			}, {
				skinColor: skinColorParam,
				hairColor: hairColorParam,
				pantsColor: pantsColorParam,
				tshirtColor: tshirtParamParam
			}, function(err, player) {
				if(err){
					res.redirect('/');
				}else{
					global.player.skinColor = skinColorParam;
					global.player.hairColor = hairColorParam;
					global.player.pantsColor = pantsColorParam;
					global.player.tshirtColor = tshirtParamParam
					
					res.redirect('/');
				}
			});
		} else if (req.method == 'GET') {
			console.log(global.player);
			res.view({
				user: req.session.user,
				player: global.player
			});
		}
	},

	levelChoice: function(req, res) {
		if (req.method == 'POST') {
			var levelParam = req.param('level');
			Player.update({
				name: global.player.name
			}, {
				gameLevel: levelParam
			}, function(err, player) {
				if (err) {
					returnMessage = err;
				} else {
					res.redirect('/player');
				}
			});

		} else if (req.method == 'GET') {
			res.view({
				user: req.session.user
			});
		}
	},



};
module.exports = PlayerController;