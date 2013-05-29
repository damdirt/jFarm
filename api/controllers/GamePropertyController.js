/*---------------------
	:: GameProperty 
	-> controller
---------------------*/
var GamePropertyController = {

	index: function(req, res) {
		// return list of gameProperties
		GameProperty.findAll().done(function(err, gameProperties) {
			if (err) {
				res.view({
					user: req.session.user,
					gameProperties: {},
					responseMessage: err
				})
			} else {
				res.view({
					user: req.session.user,
					gameProperties: gameProperties,
					responseMessage: "gameProperties list"
				})
			}
		});
	},

	delete: function(req, res) {
		GameProperty.destroy({
			name: req.param('name')
		}, function(error) {
			if (error) {
				res.send(error)
			} else {
				res.send('done')
			}
		});
	},

	createEdit: function(req, res) {
		if (req.method == 'POST') {
			var methodParam = req.param('method'),
				nameParam = req.param('name'),
				idParam = req.param('id'),
				valueParam = req.param('value');

			// check if post's params exist
			if (!(methodParam || nameParam || valueParam)) {
				res.view({
					user: req.session.user,
					gameProperties: {},
					responseMessage: "No name or value specified!"
				})
			} else {
				// check if GameProperty's name already exist
				if (methodParam == 'create') {
					GameProperty.find({
						name: nameParam
					}).done(function(err, obj) {
						if (err || !obj) {
							GameProperty.create({
								name: nameParam,
								content: valueParam
							}).done(function(err, obj) {
								if (err) {
									// Error handling during creating appObject
									res.redirect('/gameProperty');
								} else {
									// The appObject was created successfully!
									res.redirect('/gameProperty');
								}
							});
						} else {
							// case when appObject already exist
							res.redirect('/gameProperty');
						}
					});
				} else if (methodParam == 'edit') {
					AppObject.find({
						name: nameParam
					}).done(function(err, obj) {
						if (err || !obj) {
							GameProperty.update({
								id: idParam
							}, {
								name: nameParam,
								content: valueParam
							}, function(err, gameProperty) {
								// Error handling
								if (err) {
									res.redirect('/gameProperty');
								} else {
									res.redirect('/gameProperty');
								}
							});
						} else {
							// case when gameProperty already exist
							res.redirect('/gameProperty');
						}
					});
				}

			}

		}
	}

};
module.exports = GamePropertyController;