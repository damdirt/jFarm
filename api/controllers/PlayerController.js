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
				player: req.session.player
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
	conquer: function(req,res){
		if (!req.isAjax) {
			res.redirect('/');
		} else {
			if(req.param("yards")){
				var yardsReq = []
					,coordsArr = req.param("yards").split(';');
				for (i = 0; i < coordsArr.length; i++) {
					var coord = coordsArr[i].split(',')
						,yard = {
							'x': coord[0],
							'y': coord[1]
						}
					yardsReq.push(yard)
				}
				// we check if all yards are free and belong to logged player
				Yard.findAll({
					where: {
						or: yardsReq,
						free: true
					}
				}).done(function(err, yards){

					// All yards are free if we pass here, we can create an object :)
					if(yards.length == yardsReq.length){

						Yard.update({
							where: {
								or: yardsReq
							}
						}, {
							neutral: false,
							playerId: req.session.player.id,
							free: false
						}, function(err, yards) {
							// Error handling
							if (err) {
								console.log({
									sucess: false,
									message: "Error occured during tile(s) updating",
									error: err
								});
							} else {
								res.end(JSON.stringify({
									'success': true,
									'message': 'Tiles conquered',
									'error': null,
									'yards': req.param("yards")
								}));
							}
						});
					} else {
						res.end(JSON.stringify({
							'success': false,
							'message': 'Sorry, this/some selected tile(s) is/are not free\nor own this/these tile(s) before',
							'error': err
						}));
					}
				});
			} else {
				res.end(JSON.stringify({
					'success': false,
					'message': 'parameter(s) missing',
					'error': null
				}));
			}
		}
	}


};
module.exports = PlayerController;