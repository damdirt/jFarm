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
		var respawnX, respawnY;

		if (req.method == 'POST') {
			Player.update({
				name: req.session.player.name
			}, {
				skinColor: skinColorParam,
				hairColor: hairColorParam,
				pantsColor: pantsColorParam,
				tshirtColor: tshirtParamParam
			}, function(err, player) {
				if (err) {
					res.redirect('/');
				} else {
					req.session.player.skinColor = skinColorParam;
					req.session.player.hairColor = hairColorParam;
					req.session.player.pantsColor = pantsColorParam;
					req.session.player.tshirtColor = tshirtParamParam;
					res.redirect('/');
				}
			});
		} else if (req.method == 'GET') {
			res.view({
				user: req.session.user,
				player: req.session.player
			});
		}
	},

	levelChoice: function(req, res) {
		if (req.method == 'POST') {
			var levelParam = req.param('level');
			Player.update({
				name: req.session.player.name
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


	}
};
module.exports = PlayerController;