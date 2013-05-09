// api/controllers/AuthController.js

var AuthController = {

	index: function(req, res) {
		res.view();



	},


	signup: function(req, res) {

		var usernameParam = req.param('username');
		var emailParam = req.param('email');
		var passwordParam = req.param('password');

		console.log(usernameParam);
		console.log(emailParam);
		console.log(passwordParam);



		// No username/password entered
		if (!(usernameParam && emailParam && passwordParam)) {
			// res.send("No username, emaill or password specified!", 500);
			console.log("No username, emaill or password specified!");
			// TODO: redirect, storing an error in the session
			res.view();
		} else {
			User.create({
				username: usernameParam,
				email: emailParam,
				password: passwordParam
			}).done(function(err, user) {

				// Error handling
				if (err) {
					return console.log(err);

					// The User was created successfully!
				} else {
					req.session.authenticated = true;
					req.session.User = user;
					console.log("User created:", user);
					res.redirect('/');
				}
			});
			res.view();
		}
	},



	logout: function(req, res) {
		req.session.authenticated = false;
		req.session.User = null;
		res.redirect('/');
	},

	login: function(req, res) {



		// Get password and username from request
		var usernameParam = req.param('username');
		var passwordParam = req.param('password');



		// No username/password entered
		if (!(usernameParam && passwordParam)) {
			console.log("No username or password specified!");
			// res.send("No username or password specified!", 500);
			// TODO: redirect, storing an error in the session
			res.view();
		} else {
			// Lookup the username/password combination
			User.find({
				username: usernameParam
			}).done(function(err, user) {



				// Login failed, incorrect username/password combination
				if (err || !user) {


					console.log("Invalid username !");
					// res.send("Invalid username and password combination!", 500);
					// TODO: redirect, storing an error in the session
					res.view();
				}

				// Login succeeded
				if (user) {

					if (user.password == passwordParam) {
						console.log('Utilisateur trouvé et mdp correct : ' + user.username);
						req.session.authenticated = true;
						req.session.User = user;

						// Redirect to protected area
						res.redirect('/');
					} else {
						console.log('Mot de passe incorrect');
						res.view();
					}

				}
			});
		}


	}

};

module.exports = AuthController;