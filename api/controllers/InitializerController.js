/*---------------------
	:: Initializer 
	-> controller
---------------------*/
var InitializerController = {

	index: function() {

		//----------------------- SKIN COLOR ----------------------
		GameProperty.find({
			name: 'skinColor',
		}).done(function(err, prop) {

			// Error handling
			if (err) {
				console.log(error);
			} else {
				global.skinColor = prop.content;
			}
		});

		//----------------------- TSHIRT COLOR ----------------------
		GameProperty.find({
			name: 'tshirtColor',
		}).done(function(err, prop) {

			// Error handling
			if (err) {
				console.log(error);
			} else {
				global.tshirtColor = prop.content;
			}
		});

		//----------------------- PANTS COLOR ----------------------
		GameProperty.find({
			name: 'pantsColor',
		}).done(function(err, prop) {

			// Error handling
			if (err) {
				console.log(error);
			} else {
				global.pantsColor = prop.content;
			}
		});

		//----------------------- HAIR COLOR ----------------------
		GameProperty.find({
			name: 'hairColor',
		}).done(function(err, prop) {

			// Error handling
			if (err) {
				console.log(error);
			} else {
				global.hairColor = prop.content;
			}
		});

	}


};
module.exports = InitializerController;



