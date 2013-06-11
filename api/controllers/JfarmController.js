/*---------------------
	:: JfarmController
	-> controller
---------------------*/

var JfarmController = {

	// this method returns all templates at game loading pages
	templates: function(req, res) {
		WeaponTemplate.findAll().done(function(err,wtpls){
			if(!err){
				CropTemplate.findAll().done(function(err,ctpls){
					if(!err){
						BuildingTemplate.findAll().done(function(err, btpls){
							if(!err){
								GameProperty.findAll().done(function(err,gptpls){
									if(!err){
										res.end(JSON.stringify({
											'success': true,
											'message': 'Ok',
											'error': null,
											'message': {
												'weaponsTpls': wtpls,
												'cropTpls': ctpls,
												'buildingTpls': btpls,
												'gamePropertyTpls': gptpls,
											}
										}));
									} else {
										res.end(JSON.stringify({
											'success': false,
											'message': 'GameProperty.findAll() fail',
											'error': null
										}));
									}
								});
							} else {
								res.end(JSON.stringify({
									'success': false,
									'message': 'BuildingTemplate.findAll() fail',
									'error': null
								}));
							}
						});
					} else {
						res.end(JSON.stringify({
							'success': false,
							'message': 'CropTemplate.findAll() fail',
							'error': null
						}));
					}
				});
			} else {
				res.end(JSON.stringify({
					'success': false,
					'message': 'WeaponTemplate.findAll() fail',
					'error': null
				}));
			}
		});
	}
};

module.exports = JfarmController;