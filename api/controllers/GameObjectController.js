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

			if (req.param('x') && req.param('y') && req.param('object') && req.param('yards')) {
				var xParam = parseInt(req.param('x'));
				var yParam = parseInt(req.param('y'));
				var objParam = req.param('object');

				// convert string into integer for centerp 
				objParam.centerp.x = parseInt(objParam.centerp.x);
				objParam.centerp.y = parseInt(objParam.centerp.y);
				objParam.centerp.z = parseInt(objParam.centerp.z);

				// // convert string into integer for rot
				objParam.rot.alphaD = parseInt(objParam.rot.alphaD);
				objParam.rot.betaD = parseInt(objParam.rot.betaD);
				objParam.rot.gammaD = parseInt(objParam.rot.gammaD);

				var yardsReq = [];
				var tableau = req.param('yards').split(';');
				for (i = 0; i < tableau.length; i++) {
					var tab = tableau[i].split(',');
					var obj = {
						'x': tab[0],
						'y': tab[1]
					};
					yardsReq.push(obj)
				}
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
						GameObject.create({
							yardId: yard.id,
							content: JSON.stringify(objParam)
						}).done(function(err, obj) {
							if (err) {
								res.end(JSON.stringify({
									'success': false,
									'message': 'error occured during object creation',
									'error': err
								}));
							} else {
								res.end(JSON.stringify({
									'success': true,
									'message': 'Object created',
									'error': null
								}));
							}
						});
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
module.exports = GameObjectController;