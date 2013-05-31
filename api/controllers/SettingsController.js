/*---------------------
	:: Settings 
	-> controller
---------------------*/
var SettingsController = {

	// To trigger this action locally, visit: `http://localhost:port/settings/gameProperties`
	gameProperties: function(req, res) {

		// This will render the view: /Volumes/DATA/Documents/git/jFarm/views/settings/gameProperties.ejs
		res.view();

	},

	// To trigger this action locally, visit: `http://localhost:port/settings/appObjects`
	index: function(req, res) {
		console.log(global.defaultSkinColor);
		res.view({
			user: req.session.user
		})
	},

	appObjects: function(req, res) {

		if (req.method == 'POST') {
			var nameParam = req.param('name');
			var valueParam = req.param('value');

			// check if post's params exist
			if (!(nameParam && valueParam)) {
				res.view({
					user: req.session.user,
					responseMessage: "No name or value specified!"
				})
			} else {
				// check if appObject's name already exist
				AppObject.find({
					name: nameParam
				}).done(function(err, user) {
					if (err || !user) {
						AppObject.create({
							name: nameParam,
							value: valueParam,
						}).done(function(err, user) {
							if (err) {
								// Error handling during creating appObject
								res.view({
									user: req.session.user,
									error: err
								})
							} else {
								// The appObject was created successfully!
								res.redirect('/settings/appObjects');
							}
						});
					} else {
						// case when appObject already exist
						res.view({
							user: req.session.user,
							error: "AppObject already exists !"
						})
					}
				});
			}

		} else {
			// return list of appObjects
			AppObject.findAll().done(function(err, appObjects) {
				if (err) {
					res.view({
						user: req.session.user,
						appObjects: {},
						responseMessage: err
					})
				} else {
					res.view({
						user: req.session.user,
						appObjects: appObjects,
						responseMessage: "AppObject list"
					})
				}
			});

		}
	},

	delete: function(req, res) {

		// check if req comes from a form
		if (req.method == 'POST') {
			var nameParam = req.param('name');
			// check if post's param exist
			if (!(nameParam)) {
				res.redirect('/settings/appObjects')
			} else {
				AppObject.destroy({
					name: nameParam
				}).done(function(err) {
					// Error handling
					if (err) {
						res.redirect('/settings/appObjects')
					} else {
						res.redirect('/settings/appObjects')
					}
				});
			}
		}
	}



};
module.exports = SettingsController;