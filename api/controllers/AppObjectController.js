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
					AppObject.update({
						id: idParam
					}, {
						name: nameParam,
						content: valueParam
					}, function(err, appObject) {
						// Error handling
						if (err) {
							res.redirect('/appobject');
						} else {
							res.redirect('/appobject');
						}
					});
				}

			}

		}
	},

	delete: function(req, res) {
		AppObject.destroy({
			name: req.param('name')
		}, function(error) {
			if (error) {
				res.send(error)
			} else {
				res.send('done')
			}
		});
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

	appObjectList: function(req, res) {
		// return list of appObjects
		
		AppObject.findAll().done(function(err, appObjects) {
			if (err) {
				res.send(err)
			} else {
				var jsonObj = [];
				for (var i = 0; i < appObjects.length; i++) {
					var obj = appObjects[i].content
					 //console.log(obj);
					jsonObj[i] = JSON.parse(obj);
				}
				res.json({ "appObjects": jsonObj});
			}
		});
	}
};
module.exports = AppObjectController;