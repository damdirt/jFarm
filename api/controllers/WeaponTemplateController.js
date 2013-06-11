/*---------------------
	:: WeaponTemplateController 
	-> controller
---------------------*/
var WeaponTemplateController = {

	createEdit: function(req, res) {
		if (req.method == 'POST') {
			var methodParam = req.param('method'),
				idParam = req.param('id'),
				nameParam = req.param('name'),
				damageParam = req.param('damage'),
				hitRatioParam = req.param('hitRatio'),
				hitPerSecondParam = req.param('hitPerSecond'),
				priceParam = req.param('price'),
				centerpParam = req.param('centerp'), 
				rotParam = req.param('orientation'), 
				xParam = req.param('coordx'), 
				yParam = req.param('coordy'), 
				img64Param = req.param('img64');

			// check if post's params exist
			if (!(methodParam || nameParam ||  damageParam || hitRatioParam || hitPerSecondParam || priceParam || centerpParam || rotParam || xParam || yParam || img64Param )) {
				res.view({
					user: req.session.user,
					responseMessage: "No name or value specified!"
				})
			} else {
				// check if weapontemplate's name already exist
				if (methodParam == 'create') {
					WeaponTemplate.find({
						name: nameParam
					}).done(function(err, obj) {
						if (err || !obj) {
							WeaponTemplate.create({
								name: nameParam,
								damage: damageParam,
								hitRatio: hitRatioParam,
								hitPerSecond: hitPerSecondParam,
								price: priceParam,
								centerp: centerpParam,
								rot: rotParam,
								x: xParam,
								y: yParam,
								img64: img64Param
							}).done(function(err, obj) {
								if (err) {
									// Error handling during creating weapontemplate
									res.redirect('/settings/weapontemplate');
								} else {
									// The weapontemplate was created successfully!
									res.redirect('/settings/weapontemplate');
								}
							});
						} else {
							// case when weapontemplate already exist
							res.redirect('/settings/weapontemplate');
						}
					});
				} else if (methodParam == 'edit') {
					WeaponTemplate.update({
						id: idParam
					}, {
						name: nameParam,
						damage: damageParam,
						hitRatio: hitRatioParam,
						hitPerSecond: hitPerSecondParam,
						price: priceParam,
						centerp: centerpParam,
						rot: rotParam,
						x: xParam,
						y: yParam,
						img64: img64Param
					}, function(err, weapontemplate) {
						// Error handling
						if (err) {
							res.redirect('/settings/weapontemplate');
						} else {
							res.redirect('/settings/weapontemplate');
						}
					});
				} else {
					res.redirect('/settings/weapontemplate');
				}
			}

		}
	},
	index: function(req, res) {
		// return list of weapontemplates
		WeaponTemplate.findAll().done(function(err, weapontemplates) {
			if (err) {
				res.view({
					user: req.session.user,
					weapontemplates: {},
					responseMessage: err
				})
			} else {
				res.view({
					user: req.session.user,
					weapontemplates: weapontemplates,
					responseMessage: "WeaponTemplate list"
				})
			}
		});
	},
	jsonList: function(req, res) {
		// return list of weapon templates
		WeaponTemplate.findAll().done(function(err, weaponTemplates) {
			if (err) {
				res.send(err)
			} else {
				for (var i = 0; i < weaponTemplates.length; i++) {
					var w = weaponTemplates[i];
					w.centerp = JSON.parse(w.centerp);
					w.rot = JSON.parse(w.rot);
					w.values= undefined;
				}
				res.json({ "weaponTemplates": weaponTemplates});
			}
		});
	}
};
module.exports = WeaponTemplateController;