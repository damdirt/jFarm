// api/controllers/AuthController.js

var passwordHash = require('password-hash');

var AuthController = {

	index: function(req, res) {
		res.view({
			layout: "minLayout"
		})



	},


	signup: function(req, res) {

		var usernameParam = req.param('username');
		var emailParam = req.param('email');
		var passwordParam = req.param('password');

		// No username/password entered
		if (!(usernameParam && emailParam && passwordParam)) {
			// res.send("No username, emaill or password specified!"
			res.view({
				layout: "minLayout",
				error: "No username, emaill or password specified!"
			})

		} else {
			User.find({
				username: usernameParam
			}).done(function(err, user) {
				if (err || !user) {
					User.create({
						username: usernameParam,
						email: emailParam,
						password: passwordHash.generate(passwordParam),
                        administrator: false
					}).done(function(err, user) {

						// Error handling
						if (err) {
							res.view({
								layout: "minLayout",
								error: err
							})
							// The User was created successfully!
						} else {
							req.session.authenticated = true;
							req.session.user = user;
							// console.log("User created:", user);
							//console.log(user);
							res.redirect('/')
						}
					});
				} else {
					//console.log("Utilisateur déja existant");
					res.view({
						layout: "minLayout",
						error: "Username already used !"
					})
				}
			});


		}
	},



	logout: function(req, res) {
		req.session.authenticated = false;
		req.session.User = null;
		res.redirect('/');
	},

	login: function(req, res) {

		if (req.method == "GET") {
			res.view({
				layout: "minLayout",
				error: ""
			})
		} else if (req.method == "POST") {
			// Get password and username from request
            var arr = [];
            JSON.stringify(req.body).replace(/["{}]/g, '').split(',').forEach(function(elem) {
                arr.push(elem.split(':')[0]);
            });

            console.log(arr);


            var usernameParam = req.param('username');
			var passwordParam = req.param('password');
			// No username/password entered
			if (!(usernameParam || passwordParam)) {
				res.view({
					layout: "minLayout",
					error: "No username or password specified !"
				})
			} else {
				// Lookup the username/password combination
				User.find({
					username: usernameParam
				}).done(function(err, user) {
					// Login failed, incorrect username/password combination
					if (err || !user) {
						res.view({
							layout: "minLayout",
							error: "Invalid username !"
						})
					}
					// Login succeeded
					if (user) {
						if (passwordHash.verify(passwordParam, user.password )) {
							req.session.authenticated = true;
							req.session.user = user;
							res.redirect('/');
						} else {
							res.view({
								layout: "minLayout",
								error: "Invalid password !"
							})
						}
					}
				});
			}
		}
	}

};

module.exports = AuthController;