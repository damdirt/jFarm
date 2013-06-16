/*---------------------
	:: Harvesting 
	-> controller
---------------------*/
var HarvestingController = {

	index: function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*' // implementation of CORS
		});
		Harvesting.findAll({
			playerId: req.session.player.id
		}).done(function(err, harvestings) {
			if (!err) {
				res.end(JSON.stringify({
					success: true,
					message: "List of harvestings",
					error: null,
					harvestings: harvestings
				}));
			} else {
				res.end(JSON.stringify({
					success: false,
					message: "Error during retrieving list of harvestings",
					error: err
				}));
			}
		});
	},

	harvest: function(req, res) {
		if (req.isAjax) {

			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});

			if (req.param('cropObj') && req.param('quantity')) {

				var cropParam = req.param('cropObj'),
					quantityParam = req.param('quantity');

				CropTemplate.find({
					id: cropParam.cropTemplateId
				}).done(function(err, tpl) {
					if (tpl && !err) {
						Harvesting.create({
							name: cropParam.name,
							quantity: quantityParam,
							cropTemplateId: tpl.id,
							playerId: req.session.player.id
						}).done(function(err, harvesting) {
							if (!err) {
								// we delete harvested crop
								Crop.destroy(cropParam.cropTemplateId).done(function(err) {
									if (!err) {
										res.end(JSON.stringify({
											success: true,
											message: "Harvesting created",
											error: null,
											harvesting: harvesting
										}));
									} else {
										res.end(JSON.stringify({
											success: false,
											message: "Error during harvesting creation (crop destroy)",
											error: null
										}));
									}
								})
							} else {
								res.end(JSON.stringify({
									success: false,
									message: "Error during harvesting creation",
									error: err
								}));
							}
						});
					} else {
						res.end(JSON.stringify({
							success: false,
							message: "Crop template unfound or err",
							error: err || null
						}));
					}
				});
			} else {
				res.end(JSON.stringify({
					success: false,
					message: "parameters missing",
					error: null
				}));
			}
		} else {
			res.redirect('/');
		}
	}
}
module.exports = HarvestingController;