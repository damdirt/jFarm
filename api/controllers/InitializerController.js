/*---------------------
	:: Initializer 
	-> controller
---------------------*/
var InitializerController = {

	index: function() {



		Yard.findAll().done(function(err, yards) {
			if (!yards || yards.length == 0) {
				var i = 0;
				for (x = 0; x < 11; x++) {
					for (y = 0; y < 11; y++) {
						Yard.create({
							x: x,
							y: y,
							name: 'yard(' + x + ';' + y + ')',
							baserectcolor: '#5D7E36',
							neutral: true,
							free: true,
							fertility: Math.floor(Math.random() * 101)
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

		//----------------------- SKIN COLOR ----------------------
		GameProperty.find({
			name: 'skinColor',
		}).done(function(err, prop) {

			// Error handling
			if (!prop) {
				global.skinColor = "#FFFF00";
			} else {
				global.skinColor = prop.content;
			}
		});

		//----------------------- TSHIRT COLOR ----------------------
		GameProperty.find({
			name: 'tshirtColor',
		}).done(function(err, prop) {

			// Error handling
			if (!prop) {
				global.tshirtColor = "#FF00FF";
			} else {
				global.tshirtColor = prop.content;
			}
		});

		//----------------------- PANTS COLOR ----------------------
		GameProperty.find({
			name: 'pantsColor',
		}).done(function(err, prop) {

			// Error handling
			if (!prop) {
				global.pantsColor = "#0000FF";
			} else {
				global.pantsColor = prop.content;
			}
		});

		//----------------------- HAIR COLOR ----------------------
		GameProperty.find({
			name: 'hairColor',
		}).done(function(err, prop) {

			// Error handling
			if (!prop) {
				global.hairColor = "#555500";
			} else {
				global.hairColor = prop.content;
			}
		});

	}


};
module.exports = InitializerController;