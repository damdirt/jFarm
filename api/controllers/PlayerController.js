/*---------------------
	:: Player 
	-> controller
---------------------*/
var PlayerController = {

	// To trigger this action locally, visit: `http://localhost:port/player/builder`
	builder: function (req,res) {

		// This will render the view: /Volumes/DATA/Documents/git/jFarm/views/player/builder.ejs
		res.view({
			user : req.session.user
		});

	}

};
module.exports = PlayerController;