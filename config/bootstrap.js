// App bootstrap
// Code to run before launching the app
//
// Make sure you call cb() when you're finished.
module.exports.bootstrap = function (cb) {
	var init = require('../api/controllers/InitializerController.js');
	init.index();
	cb();
};