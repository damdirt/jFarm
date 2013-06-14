/*---------------------
	:: GameObject 
	-> controller
---------------------*/
var GameObjectController = {

	create: function(req, res) {

		if (!req.isAjax) {
			res.redirect('/');
		} else {
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});

			if (req.param('x') && req.param('y') && req.param('object') && req.param('yards') && req.param('cornerYard') && req.param('objectType') && req.param('objectName')) {

				// first, we parse yards param 
				var yardsReq = [];
				var coords = req.param('yards').split(';');
				for (i = 0; i < coords.length; i++) {
					var coord = coords[i].split(',');
					var obj = {
						'x': coord[0],
						'y': coord[1]
					};
					yardsReq.push(obj)
				}
				console.log(yardsReq);

				// we check if logged player belongs all sent yards
				Yard.findAll({
					where: {
						or: yardsReq,
						playerId: req.session.player.id
					}
				}).done(function(err, yards) {

					// All yards are free if we pass here, we can create an object :)
					if (yards.length == yardsReq.length) {
						var xParam = parseInt(req.param('x')),
							yParam = parseInt(req.param('y')),
							objParam = req.param('object'),
							cornerYardParam = req.param('cornerYard');

						// Beuuurk part beginning (better solution ???)

						// convert string into integer for centerp 
						objParam.centerp.x = parseInt(objParam.centerp.x);
						objParam.centerp.y = parseInt(objParam.centerp.y);
						objParam.centerp.z = parseInt(objParam.centerp.z);

						// convert string into integer for rot
						objParam.rot.alphaD = parseInt(objParam.rot.alphaD);
						objParam.rot.betaD = parseInt(objParam.rot.betaD);
						objParam.rot.gammaD = parseInt(objParam.rot.gammaD);

						// Beuuurk part end

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
									message: "Error occured during yard update",
									error: err
								});
							}
						});
						Yard.find({
							x: xParam,
							y: yParam,
						}).done(function(err, yard) {
							if (err) {
								res.end(JSON.stringify({
									'success': false,
									'message': 'no yard at this position',
									'error': err
								}));
							} else {
								switch (req.param('objectType')) {
									case 'building':
										var tpl = global.properties.buildingTemplates[req.param('objectName')];

										Building.create({
											name: req.param('objectName'),
											currentStorageCapacity: 0,
											ownerId: yard.playerId,
											x: yard.x,
											y: yard.y,
											cornerYard: cornerYardParam,
											buildingTemplateId: tpl.id,
											content: JSON.stringify(objParam),
											yardId: yard.id,
											objectType: req.param('objectType')
										}).done(function(err, obj) {
											if (err) {
												res.end(JSON.stringify({
													'success': false,
													'message': 'error occured during object creation',
													'error': err
												}));
											} else {
												req.session.player.money = req.session.player.money - tpl.price;
												Player.update({
													id: req.session.player.id
												}, {
													money: req.session.player.money - tpl.price
												}, function(err, player) {
													if (err) {
														res.end(JSON.stringify({
															'success': false,
															'message': 'error during player\'s money updating',
															'error': err
														}));
													} else {
														res.end(JSON.stringify({
															'success': true,
															'message': 'Object created',
															'error': null,
															'centerp': objParam.centerpToReturn,
															'cornerYard': cornerYardParam,
															'id': obj.id,
															'type': req.param('objectType'),
															'player': req.session.player
														}));
													}
												});
											}
										});
										break;
									case 'crop':
										var tpl = global.properties.cropTemplates[req.param('objectName')];

										Crop.create({
											name: req.param('objectName'),
											ownerId: yard.playerId,
											maturityLevel: 0,
											healthLevel: 0,
											x: yard.x,
											y: yard.y,
											cornerYard: cornerYardParam,
											cropTemplateId: tpl.id,
											content: JSON.stringify(objParam),
											yardId: yard.id,
											objectType: req.param('objectType')
										}).done(function(err, obj) {
											if (err) {
												res.end(JSON.stringify({
													'success': false,
													'message': 'error occured during object creation',
													'error': err
												}));
											} else {
												req.session.player.money = req.session.player.money - tpl.price;
												Player.update({
													id: req.session.player.id
												}, {
													money: req.session.player.money - tpl.price
												}, function(err, player) {
													console.log(player);
													if (err) {
														res.end(JSON.stringify({
															'success': false,
															'message': 'error during player\'s money updating',
															'error': err
														}));
													} else {
														res.end(JSON.stringify({
															'success': true,
															'message': 'Object created',
															'error': null,
															'centerp': objParam.centerpToReturn,
															'cornerYard': cornerYardParam,
															'id': obj.id,
															'type': req.param('objectType'),
															'player': req.session.player
														}));
													}
												});
											}
										});
										break;
									default:
										res.end(JSON.stringify({
											'success': false,
											'message': 'error occured during object creation (default case)',
											'error': err
										}));
										break;
								}
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

	getDetails: function(req, res) {
		if (!req.isAjax) {
			res.redirect('/');
		} else {
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});

			if (req.param('id') && req.param('type')) {
				var id = parseInt(req.param('id'));
				var type = req.param('type');
				switch (type) {
					case 'building':
						Building.find(id).done(function(err, building) {
							if (err) {
								res.end(JSON.stringify({
									'success': false,
									'message': 'error occured during object finding',
									'error': err
								}));
							} else if (building) {
								returnObject(building);
							}
						});
						break;
					case 'crop':
						Crop.find(id).done(function(err, crop) {
							if (err) {
								res.end(JSON.stringify({
									'success': false,
									'message': 'error occured during object finding',
									'error': err
								}));
							} else if (crop) {
								returnObject(crop);
							}
						});
						break;
					default:
						returnObject(null);
						break;
				}

				function returnObject(object) {
					if (object) {
						Player.find(object.ownerId).done(function(err, player) {
							if (err) {
								res.end(JSON.stringify({
									'success': false,
									'message': 'error occured during object owner finding',
									'error': err
								}));
							} else {
								player.values = undefined;
								// we return the object with player inside
								object.content = JSON.parse(object.content);
								object.owner = player;
								object.values = undefined;
								var response = JSON.stringify({
									'success': true,
									'message': 'Object found',
									'error': null,
									'obj': object
								})
								res.end(response);
							}
						});
					} else {
						res.end(JSON.stringify({
							'success': false,
							'message': 'no object with this id',
							'error': null
						}));
					}
				}

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
module.exports = GameObjectController;