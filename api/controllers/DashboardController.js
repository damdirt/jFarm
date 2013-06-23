/*---------------------
	:: Dashboard 
	-> controller
---------------------*/


var DashboardController = {
	home: function(req, res) {

		var user = req.session.user;
		req.socket.on('disconnect', function() {
			console.log("logout");
		});

		res.view({
			user: user,
			player: req.session.player
		});
	},
	contact: function(req, res) {
		var user = req.session.user;
		res.view({
			user: user
		});
	},
	action: function(req, res) {
		data = req.param('data');

		switch (data.action) {
			case 'login':
				req.socket.broadcast.emit('login', data);
				res.json({
					playingUsers: global.playingUsers
				})
				global.playingUsers['e' + data.player.id] = data;
				break;
			case 'move':
				global.playingUsers['e' + data.player.id] = data;
				req.socket.broadcast.emit('data', data);
				break;
			case 'logout':
				if (global.playingUsers.hasOwnProperty('e' + data.playerId)) {
					global.playingUsers['e' + data.playerId] = undefined;
					req.socket.broadcast.emit('logout', data);
				}
				break;
			case 'newObj':
					console.log("server successfuly received request");
					req.socket.broadcast.emit('newobj', data);
				break;
		}
	}
};
module.exports = DashboardController;