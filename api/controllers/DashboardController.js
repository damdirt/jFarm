/*---------------------
	:: Dashboard 
	-> controller
---------------------*/
var DashboardController = {

	// To trigger this action locally, visit: `http://localhost:port/dashboard/home`
	home: function (req,res) {

		// This will render the view: /Volumes/DATA/Documents/git/jFarm/views/dashboard/home.ejs
		res.view();

	}

};
module.exports = DashboardController;