/*---------------------
	:: Dashboard 
	-> controller
---------------------*/
// var init = require('./InitializerController.js');
var DashboardController = {
	home: function (req,res) {
		var user = req.session.user;
		res.view({
			user : user,
			player: global.player
		});
	},
	contact: function (req,res) {
		var user = req.session.user;
		res.view({
			user : user
		});
	}
};
module.exports = DashboardController;