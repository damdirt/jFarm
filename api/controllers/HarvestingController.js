/*---------------------
	:: Harvesting 
	-> controller
---------------------*/
var HarvestingController = {

	harvest: function(req,res){
		if(req.isAjax){

			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});

			if(req.param('cropObj') && req.param('productivity')){

				var cropParam = req.param('cropObj')
					,productivityParam = req.param('productivity');

				CropTemplate.find({
					id: cropParam.cropTemplateId
				}).done(function(err,tpl){
					if(tpl && !err){
						Harvesting.create({
							name: cropParam.name,
							productivity: productivityParam,
							cropTemplateId: tpl.id,
							playerId: req.session.player.id
						}).done(function(err, harvesting){
							if(!err){
								// we delete harvested crop
								Crop.destroy(cropParam.id).done(function(err){
									if(!err){
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