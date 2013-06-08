// App bootstrap
// Code to run before launching the app
//
// Make sure you call cb() when you're finished.
module.exports.bootstrap = function(cb) {



	global.loadProperties = function() {
		GameProperty.findAll().done(function(err, props) {
			if (props.length > 0) {
				global.properties = {};
				global.properties.respawnPoints = {};
				for (var prop in props) {
					global.properties[props[prop].name] = props[prop].content
				}
				console.log(global.properties);
			}
		});
	}

	global.setProperty = function(nameParam, valueParam) {

		
		GameProperty.update({
			name: nameParam
		}, {
			content: valueParam
		}, function(err, prop) {
			if (err) {
				return console.log(err);
			} else {
				global.properties[nameParam] = valueParam;
			}
		});

	}


	global.getRespawPoint = function(){
		Yard.findAll().done(function(err, yards) {
			if (yards.length > 0) {
				return yards[Math.floor(Math.random() * yards.length) + 1]
			}
		});
	}

	var init = require('../api/controllers/InitializerController.js');
	init.index();
	cb();
};