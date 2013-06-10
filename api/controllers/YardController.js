/*---------------------
	:: Yard 
	-> controller
---------------------*/
var YardController = {


	getYard: function(req, res) {
		if (!req.isAjax) {
			res.redirect('/');
		} else {
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});
			if (req.param('x') && req.param('y')) {
				var xParam = parseInt(req.param('x'));
				var yParam = parseInt(req.param('y'));

				Yard.find({
					x: xParam,
					y: yParam,
				}).done(function(err, yard) {
					if (err) {
						res.end(JSON.stringify({
							'success': false,
							'message': 'no yard at this position',
							'error': err
						}));
					} else {
						yard.values = undefined;
						Player.find({
							id: yard.playerId
						}).done(function(err, player) {
							if (!player) {
								yard.player = null;
							} else {
								player.values = undefined;
								yard.player = player;
							}
							res.end(JSON.stringify({
								'success': true,
								'message': 'Yard found',
								'error': null,
								'yard': yard,
							}));
						});
					}
				});
			} else {
				res.end(JSON.stringify({
					'success': false,
					'message': 'parameter(s) missing',
					'error': null
				}));
			}

		}

	},



	getYards: function(req, res, next) {

		var sorto = {
			x: "asc",
			y: "asc"
		};

		Array.prototype.keySort = function(keys) {

			keys = keys || {};

			// via
			// http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
			var obLen = function(obj) {
				var size = 0,
					key;
				for (key in obj) {
					if (obj.hasOwnProperty(key))
						size++;
				}
				return size;
			};

			// avoiding using Object.keys because i guess did it have IE8 issues?
			// else var obIx = fucntion(obj, ix){ return Object.keys(obj)[ix]; } or
			// whatever
			var obIx = function(obj, ix) {
				var size = 0,
					key;
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (size == ix)
							return key;
						size++;
					}
				}
				return false;
			};

			var keySort = function(a, b, d) {
				d = d !== null ? d : 1;
				// a = a.toLowerCase(); // this breaks numbers
				// b = b.toLowerCase();
				if (a == b)
					return 0;
				return a > b ? 1 * d : -1 * d;
			};

			var KL = obLen(keys);

			if (!KL) return this.sort(keySort);

			for (var k in keys) {
				// asc unless desc or skip
				keys[k] =
					keys[k] == 'desc' || keys[k] == -1 ? -1 : (keys[k] == 'skip' || keys[k] === 0 ? 0 : 1);
			}

			this.sort(function(a, b) {
				var sorted = 0,
					ix = 0;

				while (sorted === 0 && ix < KL) {
					var k = obIx(keys, ix);
					if (k) {
						var dir = keys[k];
						sorted = keySort(a[k], b[k], dir);
						ix++;
					}
				}
				return sorted;
			});
			return this;
		};


		if (req.param('x') && req.param('y') && req.param('appobjects') && req.param('levelsize') && !req.param('yards')) {
			var xParam = parseInt(req.param('x'));
			var yParam = parseInt(req.param('y'));
			var lvlParam = parseInt(req.param('levelsize'));


			var xStart = xParam - lvlParam,
				xEnd = (xParam + lvlParam),
				yStart = yParam - lvlParam,
				yEnd = (yParam + lvlParam);

			// console.log(
			// 	'xStart : ' + xStart + '\n' +
			// 	'xEnd : ' + xEnd + '\n' +
			// 	'yStart : ' + yStart + '\n' +
			// 	'yEnd : ' + yEnd + '\n');

			var jsonObj
			Yard.findAll({
				x: {
					'>=': xStart,
					'<=': xEnd
				},
				y: {
					'>=': yStart,
					'<=': yEnd
				}
			}).done(function(err, yards) {

				// Error handling
				if (err) {
					console.log(err);

					// Found multiple users!
				} else {
					yards.keySort(sorto);
					var objectsResponse = [];
					var waiting = 0;

					for (var i = 0; i < yards.length; i++) {
						waiting++;
						yards[i].objects = [];
						yards[i].sheets = [];
						GameObject.findAll({
							yardId: yards[i].id
						}).done(function(err, obj) {
							waiting--;
							if (obj) {
								if (obj.length != 0) {
									objectsResponse[obj[0].yardId] = obj;
								}
							}
							complete();
						});
					}
				}

				function complete() {
					if (!waiting) {

						for (var i = 0; i < yards.length; i++) {
							yards[i].values = undefined;
							yards[i].createdAt = undefined;
							yards[i].updatedAt = undefined;
							if (objectsResponse[yards[i].id]) {

								for (var j = 0; j < objectsResponse[yards[i].id].length; j++) {
									var obj = objectsResponse[yards[i].id][j]
										,json = JSON.parse(obj.content)
									json.id = obj.id;
									json.cornerYard = obj.cornerYard;
									yards[i].objects.push(json);
								}
							}
						}


						var waitingAppObjects = 0;
						AppObject.findAll().done(function(err, appObjects) {
							if (err) {
								res.send(err)
							} else {
								var appObjectsArr = [];
								for (var i = 0; i < appObjects.length; i++) {
									if (i == (appObjects.length - 1)) {
										waitingAppObjects = 0;
									} else {
										waitingAppObjects = 1;
									}

									var obj = appObjects[i].content
									//console.log(obj);
									appObjectsArr[i] = JSON.parse(obj);
									completeAppObjects(appObjectsArr);
								}
							}
						});


						function completeAppObjects(appObjectsResponse) {
							if (!waitingAppObjects) {

								res.writeHead(200, {
									'Content-Type': 'application/json',
									'Access-Control-Allow-Origin': '*' // implementation of CORS
								});
								res.end(JSON.stringify({
									'yards': yards,
									'appobjects': appObjectsResponse,
									'center': {
										x: xParam,
										y: yParam
									},
									level: 1
								}));
							}
						}
					}
				}

			});
		} else if (req.param('x') && req.param('y') && req.param('appobjects') && req.param('yards') && !req.param('levelsize')) {

			var yardsReq = [];
			var tableau = req.param('yards').split(';');
			for (i = 0; i < tableau.length; i++) {
				var tab = tableau[i].split(',');
				var obj = {
					'x': tab[0],
					'y': tab[1]
				};
				yardsReq.push(obj)
			}
			Yard.findAll({
				where: {
					or: yardsReq
				}
			}).done(function(err, yards) {
				if (err) {
					console.log(err);
				} else {
					var waiting = 0;
					var objectsResponse = [];
					for (var i = 0; i < yards.length; i++) {
						waiting++;
						yards[i].objects = [];
						yards[i].sheets = [];
						GameObject.findAll({
							yardId: yards[i].id
						}).done(function(err, obj) {
							waiting--;
							if (obj) {
								if (obj.length != 0) {
									objectsResponse[obj[0].yardId] = obj;
								}
							}
							complete();
						});
					}

					function complete() {
						if (!waiting) {
							for (var i = 0; i < yards.length; i++) {
								yards[i].values = undefined;
								yards[i].createdAt = undefined;
								yards[i].updatedAt = undefined;
								if (objectsResponse[yards[i].id]) {

									for (var j = 0; j < objectsResponse[yards[i].id].length; j++) {
										var obj = objectsResponse[yards[i].id][j]
											,json = JSON.parse(obj.content)
										json.id = obj.id;
										json.cornerYard = obj.cornerYard;
										yards[i].objects.push(json);
									}
								}
							}
							res.writeHead(200, {
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': '*' // implementation of CORS
							});
							res.end(JSON.stringify({
								yards: yards.keySort(sorto),
								center: {
									x: req.param('x'),
									y: req.param('y')
								},
								level: 1
							}));
						}
					}
				}
			});
		} else {
			res.json({
				"response": "Parameter(s) missing"
			})
		}
	}
};
module.exports = YardController;