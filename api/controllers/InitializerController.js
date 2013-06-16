/*---------------------
	:: Initializer 
	-> controller
---------------------*/
var InitializerController = {
	index: function() {
		global.playingUsers = {}
		global.loadProperties();

		setTimeout(function() {
			Yard.findAll().done(function(err, yards) {
			if (!yards || yards.length == 0) {
				var i = 0;
				for (x = 0; x < global.properties.defaultYardNumber; x++) {
					for (y = 0; y < global.properties.defaultYardNumber; y++) {
						Yard.create({
							x: x,
							y: y,
							name: 'yard(' + x + ';' + y + ')',
							baserectcolor: '#5D7E36',
							neutral: true,
							free: true,
							fertility: Math.floor(Math.random() * 101),
							humidity: Math.floor(Math.random() * 101)
						}).done(function(err, yard) {
							// Error handling
							if (err) {
								console.log(err);
							} else {
								console.log("Yard created: " + yard.name);
							}

						});

					}
				}
			}
		});
		}, 2000);
		

		User.findAll().done(function(err, users) {
				for (i = 0; i < users.length; i++) {
					User.update({
						id: users[i].id
					}, {
						online: false
					}, function(err, user) {
						if (err) {
							console.log(err);
						}
					});
				}
		});

		setTimeout(function() {
			global.loadTemplates();
		}, 2000);
	}
};
module.exports = InitializerController;