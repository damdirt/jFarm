/*---------------------
	:: Dashboard 
	-> controller
---------------------*/
var DashboardController = {
	home: function (req,res) {
		var user = req.session.user;
		res.view({
			user : user
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