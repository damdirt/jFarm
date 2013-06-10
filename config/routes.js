// Routes
// *********************
// 
// This table routes urls to controllers/actions.
//
// If the URL is not specified here, the default route for a URL is:  /:controller/:action/:id
// where :controller, :action, and the :id request parameter are derived from the url
//
// If :action is not specified, Sails will redirect to the appropriate action 
// based on the HTTP verb: (using REST/Backbone conventions)
//
//		GET:	/:controller/read/:id
//		POST:	/:controller/create
//		PUT:	/:controller/update/:id
//		DELETE:	/:controller/destroy/:id
//
// If the requested controller/action doesn't exist:
//   - if a view exists ( /views/:controller/:action.ejs ), Sails will render that view
//   - if no view exists, but a model exists, Sails will automatically generate a 
//       JSON API for the model which matches :controller.
//   - if no view OR model exists, Sails will respond with a 404.
//
module.exports.routes = {


	//----------------- DEFAULT --------------------
	'/': {
		controller: 'dashboard',
		action: 'home'
	},

	'/home': {
		controller: 'dashboard',
		action: 'home'
	},

	'/contact': {
		controller: 'dashboard',
		action: 'contact'
	},
	//----------------- END DEFAULT -----------------


	// ----------------- AUTH ---------------------
	'/login': {
		controller: 'auth',
		action: 'login'
	},

	'/signup': {
		controller: 'auth',
		action: 'signup'
	},

	'/logout': {
		controller: 'auth',
		action: 'logout'
	},
	//------------------ END AUTH -------------------

	//------------------ USER ------------------------

	'/me': {
		controller: 'user',
		action: 'profile'
	},

	'/pwd': {
		controller: 'user',
		action: 'changePwd'
	},

	//------------------ END USER ------------------------



	//------------------- SETTINGS ------------------------

	'/settings': {
		controller: 'settings',
		action: 'index'
	},

	'/settings/appobject/createEdit': {
		controller: 'appObject',
		action: 'createEdit'
	},

	'/settings/appobject': {
		controller: 'appObject',
		action: 'index'
	},

	'/settings/appobjects': {
		controller: 'appObject',
		action: 'appObjectList'
	},

	'/settings/gameproperty': {
		controller: 'gameProperty',
		action: 'index'
	},

	'/settings/gameproperty/createEdit': {
		controller: 'gameProperty',
		action: 'createEdit'
	},

	//------------------- END SETTINGS ----------------------

	//------------------- PLAYER -----------------------------

	'/player': {
		controller: 'player',
		action: 'builder'
	},

	'/player/gamelevel': {
		controller: 'player',
		action: 'levelChoice'
	},

	'/player/conquer': {
		controller: 'player',
		action: 'conquer'
	},

	//-------------------- END PLAYER ------------------------

	//-------------------- INITIALIZER ------------------------

	'/init': {
		controller: 'initializer',
		action: 'index'
	},

	//-------------------- END INITIALISER ---------------------

	//-------------------- YARD ------------------------


	'/yards': {
		controller: 'yard',
		action: 'getYards'
	},

	'/yard/getdetails/:x/:y': {
		controller: 'yard',
		action: 'getYard'
	},

	'/yards/init': {
		controller: 'yard',
		action: 'init'
	},

	'/yards/growmap': {
		controller: 'yard',
		action: 'growMap'
	},

	//-------------------- END YARD ---------------------

	//-------------------- OBJECT ------------------------


	'/gameobject/create': {
		controller: 'gameobject',
		action: 'create'
	},
	'/gameobject/getdetails/:id/:type': {
		controller: 'gameobject',
		action: 'getDetails'
	}

	//-------------------- END YARD ---------------------

	// Keep in mind default routes exist for each of your controllers
	// So if you have a UserController with an action called "juggle" 
	// a route will be automatically exist mapping it to /user/juggle.
	//
	// Additionally, unless you override them, new controllers will have 
	// create(), find(), findAll(), update(), and destroy() actions, 
	// and routes will exist for them as follows:
	/*

	// Standard RESTful routing
	// (if index is not defined, findAll will be used)
	'get /user': {
		controller	: 'user',
		action		: 'index'
	}
	'get /user/:id': {
		controller	: 'user',
		action		: 'find'
	}
	'post /user': {
		controller	: 'user',
		action		: 'create'
	}
	'put /user/:id': {
		controller	: 'user',
		action		: 'update'
	}
	'delete /user/:id': {
		controller	: 'user',
		action		: 'destroy'
	}
	*/
};