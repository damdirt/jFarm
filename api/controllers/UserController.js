/*---------------------
	:: User 
	-> controller
---------------------*/
var passwordHash = require('password-hash');



var UserController = {


    getYard: function(req, res) {
        res.json(req.session.user);
    },



	profile: function(req, res) {
		var user = req.session.user
		console.log(user);
		// This will render the view: /Volumes/DATA/Documents/git/jFarm/views/dashboard/home.ejs
		res.view({
			user: user,
			player: global.player
		});

	},

	changePwd: function(req, res) {

		var returnMessage = "";

		if (req.method == 'POST') {
			var password = req.param('password');
			var checkPassword = req.param('checkPassword');

			if (password && checkPassword) {
				if (password === checkPassword) {
					User.update({
						username: req.session.user.username
					}, {
						password: passwordHash.generate(password),
					}, function(err, user) {
						if (err) {
							returnMessage = err;
						} else {
							returnMessage = "Password changed !";
							console.log("Password changed !");
							// res.emit('changePwd', { result: 'Password changed !' });


						}
					});
				} else {
					returnMessage = "Please, passwords must match";
				}
			}
		}
		
		res.view({
			user: req.session.user,
			responseMessage : returnMessage
		});
		res.emit('changePwd', { result: 'Password changed !' });
	}

};







module.exports = UserController;