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
							Player.create({
								name: user.username,
								skinColor: global.properties.skinColor,
								tshirtColor: global.properties.tshirtColor,
								pantsColor: global.properties.pantsColor,
								hairColor: global.properties.hairColor,
								gameLevel: "easy",
								level: 1,
								money: 0,
								respawnX: 0,
								respawnY: 0,
								health: 50,
								regenerationSpeed: 5
							}).done(function(err, player) {
								if (err) {
									res.view({
										layout: "minLayout",
										error: err
									})
								} else {
									if (global.properties.firstPlayer == 0) {
										growMap(player);
									} else {
										global.setProperty("firstPlayer", false);
									}
									req.session.player = player;
									res.redirect('/player/gamelevel')
								}
							});
						}
					});
				} else {
					res.view({
						layout: "minLayout",
						error: "Username already used !"
					})
				}
			});

		}

		function growMap(player) {
			var newYards = [];
			Yard.findAll().done(function(err, yards) {
				if (yards.length != 0) {
					var mapWidth = Math.sqrt(yards.length);
					createYard(0, mapWidth, mapWidth, 1)

					function createYard(x, y, mapWidthParam, step) {
						Yard.create({
							x: x,
							y: y,
							name: 'yard(' + x + ';' + y + ')',
							baserectcolor: global.properties.yardColor,
							neutral: true,
							free: true,
							fertility: Math.floor(Math.random() * 101),
							humidity: Math.floor(Math.random() * 101)
						}).done(function(err, yard) {
							// Error handling
							if (err) {
								console.log(err);
							} else {
								newYards.push(yard);
								console.log("Yard created: " + yard.name);
								if (step == 1) {
									if (yard.y == ((mapWidthParam - 1) + global.properties.rangeToAdd) && yard.x == (mapWidthParam - 1)) {
										createYard(mapWidthParam, 0, mapWidthParam, 2);
									} else if (yard.x == (mapWidthParam - 1)) {
										createYard(0, yard.y + 1, mapWidthParam, step)
									} else if (yard.x < (mapWidthParam - 1)) {
										createYard(yard.x + 1, yard.y, mapWidthParam, step);
									}
								} else if (step == 2) {
									if (yard.y == ((mapWidthParam - 1) + global.properties.rangeToAdd) && yard.x == ((mapWidthParam - 1) + global.properties.rangeToAdd)) {
										console.log("finished !!!!");
										var respawnYard = newYards[Math.floor(Math.random() * newYards.length)];
										Player.update({
											name: player.name
										}, {
											respawnX: respawnYard.x,
											respawnY: respawnYard.y
										}, function(err, player) {
											// Error handling
											if (err) {
												console.log(err);
											}
										});
									} else if (yard.y == ((mapWidthParam - 1) + global.properties.rangeToAdd)) {
										createYard(yard.x + 1, 0, mapWidthParam, 2)
									} else if (yard.x <= ((mapWidthParam - 1) + global.properties.rangeToAdd)) {
										createYard(yard.x, yard.y + 1, mapWidthParam, 2);
									}
								}

							}
						});

					}

				}
			});
		}

	},



	logout: function(req, res) {
		req.session.authenticated = false;
		req.session.user = null;
		req.session.player = null;
		res.redirect('/');
	},

	login: function(req, res) {

		if (req.method == "GET") {
			res.view({
				layout: "minLayout",
				error: ""
			})
		} else if (req.method == "POST") {

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
						if (passwordHash.verify(passwordParam, user.password)) {
							req.session.authenticated = true;
							req.session.user = user;
							Player.find({
								name: usernameParam
							}).done(function(err, player) {
								if (player) {
									req.session.player = player;
									res.redirect('/');
								} else {
									req.session.player = ""
								}
							});

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