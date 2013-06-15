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

			if(req.param('cropObj') && req.param('productivty') && req.param('cropTemplate')){

				var cropParam = req.param('cropObj')
					,productivtyParam = req.param('productivty')
					,cropTpl = req.param('cropTemplate');

				CropTemplate.find({
					id: cropTpl
				}).done(function(err,tpl){
					if(tpl && !err){
						Harvesting.create({
							name: cropParam.name,
							productivty: productivtyParam,
							cropTemplateId: cropTpl,
							playerId: req.session.player.id
						}).done(function(err, harvesting){
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