/*---------------------
	:: Alliance 
	-> controller
---------------------*/
var AllianceController = {

	create: function(req, res) {
		if (req.isAjax) {
			var methodParam = req.param('method'),
				nameParam = req.param('name');
			idParam = req.param('id')

			if (!req.session.player.allianceId) {
				// check if post's params exist
				if (!(methodParam || nameParam || idParam)) {
					res.view({
						user: req.session.user,
						responseMessage: "No name or value specified!"
					})
				} else {
					// check if alliance's name already exist
					if (methodParam == 'create') {
						Alliance.find({
							name: nameParam
						}).done(function(err, obj) {
							if (err || !obj) {
								Alliance.create({
									name: nameParam,
									ownerId: idParam
								}).done(function(err, obj) {
									if (err) {
										res.end(JSON.stringify({
											'success': false,
											'message': 'error occured during create alliance',
											'error': err
										}));
									} else {
										req.session.player.allianceId = obj.id;
										console.log(obj.id);
										Player.update({
											id: req.session.player.id
										}, {
											allianceId: obj.id
										}, function(err, obj) {
											if (err) {
												res.end(JSON.stringify({
													'success': false,
													'message': 'error occured during create alliance',
													'error': err
												}));
											} else {
												res.end(JSON.stringify({
													'success': true,
													'message': 'Alliance created !',
													'error': null
												}));
											}
										});
									}
								});
							} else {
								res.end(JSON.stringify({
									'success': false,
									'message': 'error occured during create alliance',
									'error': err
								}));
							}
						});
					}
				}
			} else {
				res.end(JSON.stringify({
					'success': false,
					'message': 'Sorry, you already have an alliance !',
					'error': null
				}));
			}
		} else {
			res.end(JSON.stringify({
				'success': false,
				'message': 'req failed',
				'error': null
			}));
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
			// check if alliance's name already exist
			Alliance.findAll({
				name: {
					contains: kwParam
				}
			}).done(function(err, alliances) {
				if (err) {
					res.end(JSON.stringify({
						user: req.session.user,
						alliances: {},
						responseMessage: err
					}))
				} else {
					res.end(JSON.stringify({
						user: req.session.user,
						alliances: alliances,
						responseMessage: "alliance"
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
			// check if alliance's name already exist
			Alliance.find({
				id: {
					contains: kwParam
				}
			}).done(function(err, alliance) {
				if (err) {
					res.end(JSON.stringify({
						user: req.session.user,
						alliance: {},
						responseMessage: err
					}))
				} else {
					Player.findAll({
						allianceId: alliance.id
					}).done(function(err, players) {
						res.end(JSON.stringify({
							user: req.session.user,
							alliance: alliance,
							players: players,
							responseMessage: "alliance"
						}))
					});
				}
			});
		}
	},
	addPlayer: function(req, res) {
		if (req.isAjax) {
			var playerId = req.param('playerId');
			var allianceId = req.session.player.allianceId;
			if (req.session.player.allianceId) {
				Player.update({
					id: playerId
				}, {
					allianceId: allianceId
				}, function(err, player) {
					// Error handling
					if (err) {
						res.end(JSON.stringify({
							'success': false,
							'message': 'error occured during add player',
							'error': err
						}));
					} else {
						res.end(JSON.stringify({
							'success': true,
							'message': 'User added correctly !',
							'error': null
						}));
					}
				});
			}
		} else {
			res.end(JSON.stringify({
				'success': false,
				'message': 'req failed',
				'error': null
			}));
		}
	},
	removePlayer: function(req, res) {
		if (req.isAjax) {
			var playerId = req.param('playerId');
			var allianceId = req.session.player.allianceId;
			if (req.session.player.allianceId) {
				Player.update({
					id: playerId
				}, {
					allianceId: ''
				}, function(err, player) {
					// Error handling
					if (err) {
						res.end(JSON.stringify({
							'success': false,
							'message': 'error occured during remove player',
							'error': err
						}));
					} else {
						res.end(JSON.stringify({
							'success': true,
							'message': 'User removed correctly !'
						}));
					}
				});
			}
		} else {
			res.end(JSON.stringify({
				'success': false,
				'message': 'req failed',
				'error': null
			}));
		}
	}
};
module.exports = AllianceController;