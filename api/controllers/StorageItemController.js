/*---------------------
	:: StorageItem 
	-> controller
---------------------*/
var StorageItemController = {

	index: function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*' // implementation of CORS
		});

		if (req.param("buildingId")) {
			var buildingParam = req.param("buildingId");
			StorageItem.findAll({
				buildingId: buildingParam
			}).done(function(err, items) {
				if (!err) {
					res.end(JSON.stringify({
						success: true,
						message: "List of items",
						error: null,
						items: items
					}));
				} else {
					res.end(JSON.stringify({
						success: false,
						message: "Error during retrieving list of storage items",
						error: err
					}));
				}
			});
		} else {
			StorageItem.findAll({
				playerId: req.session.player.id
			}).done(function(err, items) {
				if (!err) {
					res.end(JSON.stringify({
						success: true,
						message: "List of items",
						error: null,
						items: items
					}));
				} else {
					res.end(JSON.stringify({
						success: false,
						message: "Error during retrieving list of storage items",
						error: err
					}));
				}
			});
		}
	},
	sell: function(req, res) {
		if (req.isAjax) {
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});
		} else {
			res.redirect('/');
		}
	}
}
module.exports = StorageItemController;