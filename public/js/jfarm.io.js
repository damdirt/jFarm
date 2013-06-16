//var socket = io.connect();

var serverRoot = location.href;
var socket = io.connect(serverRoot);

var jfarmio = {
	listener: function() {
		socket.on('data', jfarmio.recvData);
		socket.on('login', jfarmio.recvLogin);
		socket.on('logout', jfarmio.recvLogout);
	},

	recvData: function(data) {
		jfarm.recvData(data);
	},

	recvLogin: function(data) {
		jfarm.newEnemy(data);
	},
	recvLogout: function(data) {
		console.log(data);
		jfarm.recvLogout(data.playerId);
	},

	sendLogout: function(id){
		socket.request('/io/action', {
			data: {
				action: 'logout',
				playerId: id
			}
		}, function(response) {
				
		});
	},
	sendData: function(player, action) {
		socket.request('/io/action', {
			data: {
				action: action,
				player: player.data,
				centerp: jfarm.correctPointBeforeSend(player.centerp),
				armName: player.arm.name,
				rot: player.rot,
				animationState: player.animationState
			}
		}, function(response) {
				var players = response.playingUsers
				for (var index in players) {
					
					var data = players[index]
					
					if(data.player.id != jfarm.player.data.id){
						console.log(data);
						jfarm.newEnemy(data);
					}
				}
		});
	}
}