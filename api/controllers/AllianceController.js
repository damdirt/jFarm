/*---------------------
	:: Alliance 
	-> controller
---------------------*/
var AllianceController = {

	create: function(req, res) {
		if (req.method == 'POST') {
			var methodParam = req.param('method'),
				nameParam = req.param('name');
				idParam = req.param('id')

			if(!req.session.player.allianceId) {
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
										// Error handling during creating alliance
										res.redirect('/');
									} else {
										req.session.player.allianceId = obj.id;
										console.log(obj.id);
										Player.update({
											id: req.session.player.id
										},{
											allianceId: obj.id
										}, function(err, obj) {
											if(err) {
												res.redirect('/');
											} else {
												res.redirect('/');
											}
										});
									}
								});
							} else {
								// case when alliance already exist
								res.redirect('/');
							}
						});
					}
				}
			} else {
				res.redirect('/');
			}
		}
	},

	search: function(req, res) {
		if (req.method == 'POST') {
			var methodParam = req.param('method'),
				nameParam = req.param('name');

		// check if post's params exist
			if (!(methodParam || nameParam)) {
				res.view({
					user: req.session.user,
					responseMessage: "No name or value specified!"
				})
			} else {
				// check if alliance's name already exist
				if (methodParam == 'search') {
					Alliance.find({
						name: nameParam
					}).done(function(err, alliance) {
						console.log(alliance);
						if (err) {
							res.view({
								user: req.session.user,
								alliance: {},
								responseMessage: err
							})
						} else {
							res.view({
								user: req.session.user,
								alliance: alliance,
								responseMessage: "alliance"
							})
						}
					});
				}
			}
		}
	}
};
module.exports = AllianceController;