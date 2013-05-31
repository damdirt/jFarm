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

			if (req.param('x') && req.param('y') && req.param('object')) {
				var xParam = parseInt(req.param('x'));
				var yParam = parseInt(req.param('y'));
				var objParam = req.param('object');
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