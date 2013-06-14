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
			var levelMoney = parseFloat(global.properties[levelParam + 'LevelMoney']);
			console.log(levelMoney);
			var startMoney = parseFloat(global.properties['startMoney']);
			console.log(startMoney);
			var playerMoney = parseFloat((levelMoney * startMoney) / 100);
			console.log(playerMoney);
			

			Player.update({
				name: req.session.player.name
			}, {
				gameLevel: levelParam,
				money: playerMoney
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
	},
	search: function(req, res) {
		var kwParam = req.param('kw')
		// check if post's params exist
		if (!(kwParam)) {
			res.end(JSON.stringify({
				user: req.session.user,
				responseMessage: "No name or value specified!"
			}));
		} else {
			// check if player's name already exist
			Player.findAll({
				name: {
					contains: kwParam
				}
			}).done(function(err, players) {
				if (err) {
					res.end(JSON.stringify({
						user: req.session.user,
						players: {},
						responseMessage: err
					}))
				} else {
					res.end(JSON.stringify({
						user: req.session.user,
						players: players,
						responseMessage: "player"
					}))
				}
			});
		}
	},
	show: function(req, res) {
		var kwParam = req.param('kw')
		// check if post's params exist
		if (!(kwParam)) {
			res.end(JSON.stringify({
				user: req.session.user,
				responseMessage: "No name or value specified!"
			}));
		} else {
			// check if player's name already exist
			Player.find({
				id: kwParam
			}).done(function(err, player) {
				if (err) {
					res.end(JSON.stringify({
						user: req.session.user,
						player: {},
						responseMessage: err
					}))
				} else {
					Alliance.find({
						id: player.allianceId
					}).done(function(err, alliance) {
						res.end(JSON.stringify({
							user: req.session.user,
							currentPlayer: req.session.player,
							player: player,
							alliance: alliance,
							responseMessage: "player"
						}))
					});
				}
			});
		}
	},
	leaveAlliance: function(req, res) {
		if (req.isAjax) {
			var playerId = req.session.player.id;
			if (req.session.player.allianceId) {
				Player.update({
					id: playerId
				}, {
					allianceId: 0
				}, function(err, player) {
					// Error handling
					if (err) {
						res.end(JSON.stringify({
							'success': false,
							'message': 'error occured during leave player',
							player: {},
							'error': err
						}));
					} else {
						req.session.player.allianceId = 0;
						res.end(JSON.stringify({
							'success': true,
							'message': 'You leaved from your alliance successfully !',
							player: req.session.player,
							'error': null
						}));
					}
				});
			}
		} else {
			res.end(JSON.stringify({
				'success': false,
				'message': 'req failed',
				player: player,
				'error': null
			}));
		}
	}
};
module.exports = PlayerController;