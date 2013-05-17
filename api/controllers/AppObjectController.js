/*---------------------
	:: AppObject 
	-> controller
---------------------*/
var AppObjectController = {

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
					responseMessage: "No name or value specified!"
				})
			} else {
				// check if appObject's name already exist
				if (methodParam == 'create') {
					AppObject.find({
						name: nameParam
					}).done(function(err, obj) {
						if (err || !obj) {
							AppObject.create({
								name: nameParam,
								content: valueParam
							}).done(function(err, obj) {
								if (err) {
									// Error handling during creating appObject
									res.redirect('/appobject');
								} else {
									// The appObject was created successfully!
									res.redirect('/appobject');
								}
							});
						} else {
							// case when appObject already exist
							res.redirect('/appobject');
						}
					});
				} else if (methodParam == 'edit') {
					console.log(valueParam);
					AppObject.find({
						content: "toto"
					}).done(function(err, obj) {
						if (err || !obj) {
							AppObject.update({
								id: idParam
							}, {
								name: nameParam,
								content: valueParam
							}, function(err, user) {
								// Error handling
								if (err) {
									res.redirect('/appobject');
								} else {
									res.redirect('/appobject');
								}
							});
						} else {
							// case when appObject already exist
							res.redirect('/appobject');
						}
					});
				}

			}

		}
	},

	edit: function(req, res) {
		// update
		res.view({
			user: req.session.user,
			obj: req.param('name'),
			responseMessage: "AppObject edit"
		})
	},

	delete: function(req, res) {
		AppObject.destroy({
			name: req.param('name')
		}).done(function(error) {
			if (error) {
				return console.log(error);
			} else {
				console.log('done');
			}
		});
		res.redirect('/appobject')
	},

	index: function(req, res) {
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
	},

};
module.exports = AppObjectController;